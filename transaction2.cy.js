describe('Transaction2', () => {
    //Time-based attack (Blind SQL) with valid data
    it('Testing for retrieval of information and blind sql attack', () => {
        const startTime = performance.now();
        //performace.now() returns the timestamp in milliseconds
        cy.task(
            'queryDb', {
                query: `SELECT *, SLEEP(5) as delay FROM bank.transaction WHERE transactionId = 12;`,
            }).then((result) => {
            expect(result.length).to.equal(1);
            const transaction=result[0];
            expect(transaction.transactionId).to.equal(12)
            expect(transaction['deposit']).to.equal('40000.00')
            expect(transaction['withdrawal']).to.equal('20000.00')
            expect(transaction.amount).to.equal((transaction['deposit'] - transaction['withdrawal']).toFixed(2));
            expect(transaction.description).to.equal('ATM Withdrawal')
            const endTime = performance.now();
            const timetaken = endTime - startTime;
            expect(timetaken).to.be.greaterThan(5000);
        });
    })
    //we can also use expect(result).to.deep.equal([{
    // }]) but this doesn't work for this'
    //Time-based attack (Blind SQL) with invalid data
    it('Testing for retrieval of information and blind sql attack by sending invalid data', () => {
        const maliciousInput = `' OR '1'='1`;
        cy.task(
            'queryDb', {
                query: `SELECT *, SLEEP(5) as delay FROM bank.transaction WHERE transactionId = '${maliciousInput}';`,
            }).then((result) => {
            expect(result.length).to.equal(0);
        });
    })
    //Null-based and Time-based combined attack
    it('Testing for retrieval of information and null sql attack', () => {
        const data='NULL--'
        cy.task(
            'queryDb', {
                query: `SELECT *, SLEEP(5) as delay FROM bank.transaction WHERE transactionId = '${data}';`,
            }).then((result) => {
            expect(result.length).to.be.greaterThan(0);
        });
    })
})
