describe('Bank', () => {
    it("Fetching bank details", () => {
        cy.task('queryDb', {
            query: `SELECT * FROM bank.bank where bank_code=?`, values: [105]
        }).then((result) => {
            expect(result).to.have.length(1)
            const expected = ([{
                bank_code: 105, address: 'Kathmandu,Nepal', bank_name: 'Nepal Bank'
            }])
            expect(JSON.stringify(result)).to.equal(JSON.stringify(expected))
        })
    })

    //injection attack
    it("Fetching bank details", () => {
        const maliciousInput = `' OR '1'='1`;
        cy.task('queryDb', {
            query: `SELECT * FROM bank.bank where bank_code='${maliciousInput}'`,
        }).then((result) => {
            expect(result).to.have.length(0)
        })
    })

    //invalid and delay
    it("Fetching bank details", () => {
        const maliciousInput = `' OR '1'='1`;
        cy.task('queryDb', {
            query: `SELECT *,SLEEP(5) as delay FROM bank.bank where bank_code='${maliciousInput}'`,
        }).then((result) => {
            expect(result).to.have.length(0)
        })
    })

    //valid and delay
    it("Fetching bank details", () => {
        const startTime = performance.now()
        cy.task('queryDb', {
            query: `SELECT * , SLEEP(5) as delay FROM
             bank.bank where bank_code=?`, values: [105]
        }).then((result) => {
            expect(result).to.have.length(1)
            const expected = ([{
                bank_code: 105, address: 'Kathmandu,Nepal', bank_name: 'Nepal Bank', delay: 0,
            }])
            expect(JSON.stringify(result)).to.equal(JSON.stringify(expected))
            const endTime = performance.now()
            const timetaken = endTime - startTime
            expect(timetaken).to.be.greaterThan(5000)
            expect(timetaken).to.be.lessThan(5500)
        })
    })

    it("Inserting bank details and fetching insertion", () => {
        cy.task('queryDb', {
            query: `INSERT INTO bank(bank_code, address, bank_name) VALUES (107, 'Pokhara,Nepal', 'NMB Bank')`,
        }).then((result) => {
            expect(result.affectedRows).to.equal(1)
            return cy.task('queryDb', {
                query: `SELECT * FROM bank.bank where bank_code=?`, values: [107]
            }).then((rows) => {
                const expected = ([{
                    bank_code: 107, address: 'Pokhara,Nepal', bank_name: 'NMB Bank'
                }])
                expect(JSON.stringify(rows)).to.equal(JSON.stringify(expected))
            })
        })
    })

    //saves from sql injection attack
    it("Testing for inserting value in bank table with invalid data", () => {
        let maliciousDescriptionName = `'XYZ');
        DROP TABLE bank;--`
        cy.task('queryDb', {
            query: `INSERT INTO bank(bank_code, address, bank_name)
             VALUES (108, 'Kathmandu', '${maliciousDescriptionName}')`
        }).then((result) => {
            expect(result.error).to.exist;
        });
    })

    //saves from sql injection attack
    it("Testing for updating value in bank table with valid data", () => {
        cy.task('queryDb', {
            query: `UPDATE bank
                    SET address='New Baneshwor,Nepal',
                        bank_name='NMB Bank'
                    WHERE bank_code = ?`, values: [107]
        }).then((result) => {
            expect(result.affectedRows).to.equal(1);
            return cy.task('queryDb', {
                query: `SELECT * FROM bank.bank where bank_code=?`, values: [107]
            }).then((rows) => {
                const expected = ([{
                    bank_code: 107, address: 'New Baneshwor,Nepal', bank_name: 'NMB Bank'
                }])
                expect(JSON.stringify(rows)).to.equal(JSON.stringify(expected))
            })
        })
    })

    //saves from sql injection attack
    it("Testing for updating value in bank table with invalid data", () => {
        const maliciousbankname = `'NA');
        DROP TABLE bank;--`
        cy.task('queryDb', {
            query: `UPDATE bank
                    SET address='New Baneshwor,Nepal',
                        bank_name='${maliciousbankname}'
                    WHERE bank_code = ?`, values: [108]
        }).then((result) => {
            expect(result.error).to.exist;
        })
    })

    it.only("Testing for deletion of a bank", () => {
        cy.task('queryDb', {
            query: `DELETE FROM bank WHERE bank_code=?`, values: [108]
        }).then((result) => {
            expect(result.affectedRows).to.equal(1);
            return cy.task('queryDb', {
                query: `SELECT * FROM bank.bank where bank_code=?`, values: [108]
            }).then((rows) => {
                expect(rows).to.have.length(0)
            })
        })
    })
})