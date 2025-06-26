describe('CRUD Acc', () => {
    it("Account Creation", () => {
        cy.task('queryDb', {
            query: `INSERT INTO account(accNo,accType,balAmount,cust_id,passbook_id,bank_code) 
            VALUES (1013,'Savings',10000,1001,3,103);`
        }).then((result) => {
            expect(result.affectedRows).to.equal(1)
        })
    })
    it("Account Creation and Verifies Insertion", () => {
        cy.task('queryDb', {
            query: `INSERT INTO account(accNo,accType,balAmount,cust_id,passbook_id,bank_code) 
            VALUES (1014,'Savings',10000.00,1001,4,103);`
        }).then((result) => {
            expect(result.affectedRows).to.equal(1)
            return cy.task('queryDb', {
                query: `SELECT * FROM account WHERE accNo = ?`,
                values: [1014]
            }).then((rows) => {
                expect(rows).to.have.length(1)
                const expected = ([{
                    accNo: 1014,
                    accType: 'Savings',
                    balAmount: "10000.00",
                    cust_id: 1001,
                    passbook_id: 4,
                    bank_code: 103,
                }])
                expect(JSON.stringify(rows)).to.equal(JSON.stringify(expected))
            })
        })
    })

    it("Account fetching with valid data", () => {
        cy.task('queryDb', {
            query: `SELECT * FROM account WHERE accNo = ?`,
            values: [1003]
        }).then((result) => {
            expect(result).to.have.length(1)
            const expected = ([{
                accNo: 1003,
                accType: 'Savings',
                balAmount: "60000.00",
                cust_id: 1001,
                passbook_id: 3,
                bank_code: 103,
            }])
            expect(JSON.stringify(result)).to.equal(JSON.stringify(expected))
        })
    })

    //NOTE: SQL INJECTION ATTACK APPEARS TO BE WORKING

    it("Account fetching with invalid data", () => {
        const maliciousInput = `' O     m  R '1'='1'`;
        cy.task('queryDb', {
            query: `SELECT * FROM account WHERE accNo = '${maliciousInput}'`
        }).then((result) => {
            expect(result).to.have.length(0)
        })
    })

    it("Account updating with valid data", () => {
        cy.task('queryDb', {
            query: `UPDATE account
                    SET balAmount = 100000.00
                    WHERE accNo = ?`,
            values: [1003]
        }).then((result) => {
            expect(result.affectedRows).to.equal(1)
            return cy.task('queryDb', {
                query: `SELECT * FROM account WHERE accNo = ?`,
                values: [1003]
            }).then((rows) => {
                expect(rows).to.have.length(1)
                const expected = ([{
                    accNo: 1003,
                    accType: 'Savings',
                    balAmount: "100000.00",
                    cust_id: 1001,
                    passbook_id: 3,
                    bank_code: 103,
                }])
                expect(JSON.stringify(rows)).to.equal(JSON.stringify(expected))
            })
        })
    })

    it("Account updating with invalid data", () => {
        const maliciousInput = `' OR '1'='1;
        DROP TABLE account;--`;
        cy.task('queryDb', {
            query: `UPDATE account
                    SET balAmount = 100000.00
                    WHERE accNo = '${maliciousInput}'`
        }).then((result) => {
            expect(result.error).to.exist;
        })
    })

    it("Account deletion with valid data", () => {
        cy.task('queryDb', {
            query: `DELETE FROM atm_card WHERE accNo = ?`,
            values: [1003]
        }).then(() => {
            return cy.task('queryDb', {
                query: `DELETE FROM account WHERE accNo = ?`,
                values: [1003]
            })
        }).then((result) => {
            expect(result.affectedRows).to.equal(1);
            return cy.task('queryDb', {
                query: `SELECT * FROM account WHERE accNo = ?`,
                values: [1003]
            }).then((rows) => {
                expect(rows).to.have.length(0)
            })
        })
    })

    //USING SLEEP(blind based attack)

    it.only("Account Creation and Verifies Insertion using SLEEP", () => {
        const startTime = performance.now();

        cy.task('queryDb', {
            query: `INSERT INTO account(accNo, accType, balAmount, cust_id, passbook_id, bank_code) 
                VALUES (1017, 'Savings', 10000.00, 1001, 4, 103);`
        }).then((result) => {
            expect(result.affectedRows).to.equal(1);

            const query = `
            SELECT accNo, accType, balAmount, cust_id, passbook_id, bank_code, SLEEP(5) as delay 
            FROM account WHERE accNo = ?
            UNION
            SELECT accNo, NULL, NULL, NULL, NULL, NULL, 0 FROM atm_card WHERE accNo = 1012
        `;

            return cy.task('queryDb', {
                query: query,
                values: [1017],
            }).then((rows) => {
                const endTime = performance.now();
                const time = endTime - startTime;

                const expected = [{
                    accNo: 1017,
                    accType: 'Savings',
                    balAmount: '10000.00',
                    cust_id: 1001,
                    passbook_id: 4,
                    bank_code: 103,
                    delay: 0
                }];
                const insertedRow = rows.find(r => r.accNo === 1017);
                expect(JSON.stringify(insertedRow)).to.equal(JSON.stringify(expected[0]));
                expect(time).to.be.greaterThan(5000);
                expect(time).to.be.lessThan(5500);
            });
        });
    });
})