// In this file: some unit tests.
// Side effect: populates the database with sample data
const assert = require("assert");
const {
  connectToAppDb,
  addItemsToInventory,
  readAllInventory,
  createAnOrder,
} = require("../app/turbostock-core");
const db = connectToAppDb().content;

describe("Ecrire des données", function () {
  describe("addItemsToInventory", function () {
    it("Test: créer une nouvelle référence dans l'inventaire", function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
      const fctReturn = addItemsToInventory(db, [
        { description: "paire de sandales roses, taille 42", quantity: 12 },
      ]);
      const expectedData = JSON.stringify([
        {
          id: 1,
          description: "paire de sandales roses, taille 42",
          quantity: 12,
          is_activated: 1,
          is_featured_in_orders: 0,
        },
      ]);

      const actualData = readAllInventory(db);
      assert.equal(JSON.stringify(actualData.content), expectedData);

      assert.equal(fctReturn.err, "", "Expected no error message");
    });

    it("Test: créer plusieurs nouvelles références dans l'inventaire", function () {
      addItemsToInventory(db, [
        { description: "paire de sandales bleues, taille 38", quantity: 25 },
        { description: "crayon à papier basique", quantity: 5 },
      ]);
      const expectedData = JSON.stringify([
        {
          id: 1,
          description: "paire de sandales roses, taille 42",
          quantity: 12,
          is_activated: 1,
          is_featured_in_orders: 0,
        },
        {
          id: 2,
          description: "paire de sandales bleues, taille 38",
          quantity: 25,
          is_activated: 1,
          is_featured_in_orders: 0,
        },
        {
          id: 3,
          description: "crayon à papier basique",
          quantity: 5,
          is_activated: 1,
          is_featured_in_orders: 0,
        },
      ]);

      const actualData = readAllInventory(db).content;
      assert.equal(JSON.stringify(actualData), expectedData);
    });
  });

  describe("TODO: preparer une commande", function () {
    it("Passer une commande de 1 référence", function () {
      const message = JSON.stringify(
        createAnOrder(db, (profileId = 1), (content = [])),
      );
      const expectedMessage = JSON.stringify({
        error: "profile 1 is not allowed to create an order",
        content: [],
      });
      assert.equal(expectedMessage, message);
      // FIXME: that's not the code I actually want to write
    });
  });
});

describe("TODO: Lire des données", function () {
  describe("TODO: lire un profil", () => {});
  describe("TODO: lire une commande", () => {});
  describe("TODO: lire tout l'inventaire", () => {});
  describe("TODO: lire un objet de l'inventaire", () => {});
});

describe("TODO: Modifier des données", function () {
  describe("TODO: annuler une commande", () => {});
  describe("TODO: marquer une commande comme préparée", () => {});
  describe("TODO: Expédier une commande préparée", () => {});
  describe("TODO: Désactiver une référence de l'inventaire", () => {});
  describe("TODO: Mettre à jour le stock d'une référence de l'inventaire", () => {});
  describe("TODO: Supprimer une référence de l'inventaire", () => {});
});

describe("TODO: Controle des rôles", function () {
  describe("Rôle Supervision 1", function () {
    it("Doit pouvoir lire l'inventaire");
    it("Ne doit pas pouvoir lire les commandes");
    it("Ne doit pas pouvoir préparer une commande");
    it("Ne doit pas pouvoir marquer une commande comme préparée");
    it(
      'Ne doit pas pouvoir passer une commande préparée à l\'état "en cours de préparation"',
    );
    it("Ne doit pas pouvoir annuler une commande");
    it("Ne doit pas pouvoir expédier une commande préparée");
    it("Ne doit pas pouvoir màj le stock d'une référence de l'inventaire");
    it("Ne doit pas pouvoir supprimer une référence de l'inventaire");
    it("Ne doit pas pouvoir modifier le contenu d'une commande");
  });
  describe("Rôle Supervision 2", function () {
    it("Doit pouvoir lire l'inventaire");
    it("Doit pouvoir lire les commandes");
    it("Ne doit pas pouvoir préparer une commande");
    it("Ne doit pas pouvoir marquer une commande comme préparée");
    it(
      'Ne doit pas pouvoir passer une commande préparée à l\'état "en cours de préparation"',
    );
    it("Ne doit pas pouvoir annuler une commande");
    it("Ne doit pas pouvoir expédier une commande préparée");
    it("Ne doit pas pouvoir màj le stock d'une référence de l'inventaire");
    it("Ne doit pas pouvoir supprimer une référence de l'inventaire");
    it("Ne doit pas pouvoir modifier le contenu d'une commande");
  });
  describe("Rôle Commanditaire", function () {
    it("Doit pouvoir lire l'inventaire");
    it("Doit pouvoir lire les commandes");
    it("Doit pouvoir préparer une commande");
    it("Doit pouvoir marquer une commande comme préparée");
    it(
      'Doit pouvoir passer une commande préparée à l\'état "en cours de préparation"',
    );
    it("Doit pouvoir annuler une commande");
    it("Ne doit pas pouvoir expédier une commande préparée");
    it("Ne doit pas pouvoir màj le stock d'une référence de l'inventaire");
    it("Ne doit pas pouvoir supprimer une référence de l'inventaire");
    it(
      "Doit pouvoir modifier le contenu d'une commande en cours de préparation",
    );
    it(
      "Ne doit pas pouvoir modifier le contenu d'une commande pas en cours de préparation",
    );
  });
  describe("Rôle Livreur·se", function () {
    it("Ne doit pas pouvoir lire l'inventaire");
    it("Ne doit pas pouvoir lire les commandes");
    it("Ne doit pas pouvoir préparer une commande");
    it("Ne doit pas pouvoir marquer une commande comme préparée");
    it(
      'Ne doit pas pouvoir passer une commande préparée à l\'état "en cours de préparation"',
    );
    it("Ne doit pas pouvoir annuler une commande");
    it("Doit pouvoir pouvoir expédier une commande préparée");
    it("Doit pouvoir pouvoir expédier une commande non préparée");
    it("Ne doit pas pouvoir màj le stock d'une référence de l'inventaire");
    it("Ne doit pas pouvoir supprimer une référence de l'inventaire");
    it(
      "Doit pouvoir modifier le contenu d'une commande en cours de préparation",
    );
  });
  describe("Rôle Gestionnaire", function () {
    it("Doit pouvoir lire l'inventaire");
    it("Doit pouvoir lire les commandes");
    it("Ne doit pas pouvoir préparer une commande");
    it("Ne doit pas pouvoir marquer une commande comme préparée");
    it(
      'Ne doit pas pouvoir passer une commande préparée à l\'état "en cours de préparation"',
    );
    it("Ne doit pas pouvoir annuler une commande");
    it("Ne doit pas pouvoir pouvoir expédier une commande préparée");
    it("Doit pouvoir màj le stock d'une référence de l'inventaire");
    it("Doit pouvoir supprimer une référence inutilisée de l'inventaire");
    it(
      "Ne doit pas pouvoir supprimer une référence déjà utilisée de l'inventaire",
    );
    it("Doit pouvoir désactiver une référence déjà utilisée de l'inventaire");
    it(
      "Ne doit pas pouvoir modifier le contenu d'une commande en cours de préparation",
    );
  });
});
