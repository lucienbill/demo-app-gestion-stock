// In this file: some unit tests.
// Side effect: populates the database with sample data
const assert = require('assert');
const { connectToAppDb, addItemsToInventory, readAllInventory } = require("../app/turbostock-core");
const db = connectToAppDb()


describe('Interting data into the databse', function () {
  describe('addItemsToInventory', function () {
    it('should insert data into the inventory', function () {
        assert.equal([1, 2, 3].indexOf(4), -1);
        addItemsToInventory(db, 
            [{"description":"pair of pink sandals, size 42", "quantity":12}]
        )
        const expectedData = JSON.stringify([
            {
              id: 1,
              description: 'pair of pink sandals, size 42',
              quantity: 12,
              is_activated: 1,
              is_featured_in_orders: 0
            }
          ])

        const actualData = JSON.stringify(readAllInventory(db))
        assert.equal(expectedData, actualData)
    });
  });
});




