describe("transaction", () => {
    //SQL Injection Attack Easily
    it("FETCHING for a transaction details with invalid data", () => {
        const maliciousInput = `' OR '1'='1`;
        cy.task('queryDb',
            `SELECT *
             FROM bank.transaction
             WHERE transactionId = '${maliciousInput}' `,
        ).then((result) => {
            expect(result).to.have.length(0)
        })
    })
    //Works properly
    it("FETCHING for a transaction details with valid data", () => {
        const Input = 7;
        cy.task('queryDb',
            `SELECT *
             FROM bank.transaction
             WHERE transactionId = '${Input}' `,
        ).then((result) => {
            expect(result).to.have.length(1)
            const transaction = result[0];
            expect(transaction.transactionId).to.eq(7);
            expect(transaction.amount).to.eq('5000.00')
            expect(transaction. description).to.eq('Cash deposit');
            expect(transaction['withdrawal']).to.eq('0.00');
        })
    })
    //Note: Able to add a diff customer_id and passbook id because they're not mapped or joined
    //customer_id should come from passbook id so it should not be in the transaction table
    //and join should be added in this by db engineers
    it("Testing for inserting value in transaction with valid data", () => {
        cy.task('queryDb',
            `INSERT INTO transaction(transactionId, deposit, withdrawal, description, amount, date, time, cust_id, passbook_id)
            VALUES(15,50000.00,0.00,'Cash deposit',50000.00, CURDATE(),CURTIME(),1005,8)`
            ).then((result)=>{
                expect(result.affectedRows).to.equal(1)
        })
    })
    //Safe from SQL injection
    it("Testing for inserting value in transaction with invalid data", () => {
        const maliciousDescriptionName = `XYZ');
         DROP TABLE transaction; --`;
        cy.task(
            'queryDb',
            `INSERT INTO transaction(transactionId, deposit, withdrawal, description, amount, date, time, cust_id, passbook_id)
             VALUES (15,5000.00,0.00,'${maliciousDescriptionName}',5000.00,'2025-06-10','13:15:20',1005,7)`
        ).then((result) => {
            expect(result.error).to.exist;
        });
    })
    it("Updating value in transaction with valid data",()=>{
        cy.task(
            'queryDb',
            'UPDATE transaction SET deposit=50000.00, withdrawal=10000.00,description="ATM Withdrawal",amount=deposit-withdrawal, time=CURRENT_TIME, date=current_date WHERE transactionId=15;'
        )
    })
    it.only("Updating value in transaction with invalid data",()=>{
        const maliciousdescriptionname=`XYZ');
        DROP TABLE transaction;--`;
        cy.task(
            'queryDb',
            `UPDATE transaction SET deposit=50000.00, withdrawal=10000.00, description='${maliciousdescriptionname}', amount=deposit-withdrawal, time=CURRENT_TIME, date=current_date WHERE transactionId=15;`
        ).then((result)=>{
            expect(result.error).to.exist;
        })
    })
})