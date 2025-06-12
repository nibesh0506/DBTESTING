describe('Transaction2', () => {
    //Time-based attack (Blind SQL) with valid data
    it('Testing for retrieval of information and blind sql attack', () => {
        cy.task(
            'queryDb', {
                query: `SELECT *, SLEEP(5) as delay FROM bank.transaction WHERE transactionId = 12;`,
            }).then((result) => {
            expect(result.length).to.equal(1);
        });
    })
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
    //Null-based attack
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