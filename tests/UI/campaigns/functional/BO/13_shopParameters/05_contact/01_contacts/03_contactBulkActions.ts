// Import utils
import testContext from '@utils/testContext';

// Import pages
import contactsPage from '@pages/BO/shopParameters/contact';
import addContactPage from '@pages/BO/shopParameters/contact/add';

import {expect} from 'chai';
import {
  boDashboardPage,
  boLoginPage,
  type BrowserContext,
  FakerContact,
  type Page,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'functional_BO_shopParameters_contact_contacts_contactBulkActions';

// Create contacts then delete with Bulk actions
describe('BO - Shop Parameters - Contact : Bulk delete contacts', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  let numberOfContacts: number = 0;

  const firstContactData: FakerContact = new FakerContact({title: 'todelete'});
  const secondContactData: FakerContact = new FakerContact({title: 'todelete'});

  // before and after functions
  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);
  });

  it('should login in BO', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'loginBO', baseContext);

    await boLoginPage.goTo(page, global.BO.URL);
    await boLoginPage.successLogin(page, global.BO.EMAIL, global.BO.PASSWD);

    const pageTitle = await boDashboardPage.getPageTitle(page);
    expect(pageTitle).to.contains(boDashboardPage.pageTitle);
  });

  it('should go to \'Shop parameters > Contact\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToContactsPage', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.shopParametersParentLink,
      boDashboardPage.contactLink,
    );
    await contactsPage.closeSfToolBar(page);

    const pageTitle = await contactsPage.getPageTitle(page);
    expect(pageTitle).to.contains(contactsPage.pageTitle);
  });

  it('should reset all filters and get number of contacts in BO', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetFilterFirst', baseContext);

    numberOfContacts = await contactsPage.resetAndGetNumberOfLines(page);
    expect(numberOfContacts).to.be.above(0);
  });

  // 1 : Create 2 contacts In BO
  describe('Create 2 contacts in BO', async () => {
    const tests = [
      {args: {contactToCreate: firstContactData}},
      {args: {contactToCreate: secondContactData}},
    ];

    tests.forEach((test, index: number) => {
      it('should go to add new contact page', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `goToNewContactPage${index + 1}`, baseContext);

        await contactsPage.goToAddNewContactPage(page);

        const pageTitle = await addContactPage.getPageTitle(page);
        expect(pageTitle).to.contains(addContactPage.pageTitleCreate);
      });

      it('should create contact and check result', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `CreateContact${index + 1}`, baseContext);

        const textResult = await addContactPage.createEditContact(page, test.args.contactToCreate);
        expect(textResult).to.equal(contactsPage.successfulCreationMessage);

        const numberOfContactsAfterCreation = await contactsPage.getNumberOfElementInGrid(page);
        expect(numberOfContactsAfterCreation).to.be.equal(numberOfContacts + index + 1);
      });
    });
  });

  // 2 : Delete Contacts created with bulk actions
  describe('Delete contacts with Bulk Actions', async () => {
    it('should filter list by title', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterForBulkDelete', baseContext);

      await contactsPage.filterContacts(page, 'name', 'todelete');

      const numberOfContactsAfterFilter = await contactsPage.getNumberOfElementInGrid(page);
      expect(numberOfContactsAfterFilter).to.be.at.most(numberOfContacts);

      for (let i = 1; i <= numberOfContactsAfterFilter; i++) {
        const textColumn = await contactsPage.getTextColumnFromTableContacts(page, i, 'name');
        expect(textColumn).to.contains('todelete');
      }
    });

    it('should delete contacts with Bulk Actions and check result', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'bulkDeleteContacts', baseContext);

      const deleteTextResult = await contactsPage.deleteContactsBulkActions(page);
      expect(deleteTextResult).to.be.equal(contactsPage.successfulMultiDeleteMessage);
    });

    it('should reset all filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFilterAfterDelete', baseContext);

      const numberOfContactsAfterReset = await contactsPage.resetAndGetNumberOfLines(page);
      expect(numberOfContactsAfterReset).to.be.equal(numberOfContacts);
    });
  });
});
