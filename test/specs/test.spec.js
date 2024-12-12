import { describe, it, before } from 'mocha';
import assert from 'assert';
import { expect } from 'chai';
var assert = require('assert');

describe("Test Trello page",() =>{

    it('T1-User signs up for a new Trello account', async () =>{
        await browser.url('https://trello.com');
        await expect(browser).toHaveTitle('')
        const singUp = await $('div[class="link-buttonstyles__BxpButton-sc-1utqn26-1 inwKxu"]')
        await singUp.click();
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/signup'));

        const emailField= await $('#email').isDisplayed();
        expect (emailField).toBeDisplayed();

        const uniqueSuffix = `+${Date.now()}@example.com`;
       
        await emailField.setValue(`+${Date.now()}@example.com`);

        const signUpButton = await $('#signup-submit');
        await signUpButton.click();
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/welcome'),
            {
                timeout: 5000,
                timeoutMsg: 'Expected to be in welcome dashboard after signup'
            })


         console.log('Check email box for the confirmation email.'); 
         const dashboardTitle = await $('h1.dashboard-title').getText();
         expect(dashboardTitle).to.include('Welcome');
    })
});
    

    it('T2- User sign in and redirect to dashboard', async () => {
        // await browser.url('https://trello.com/login');
        await $('#login-form').waitForDisplayed();

        const userNameInput = await $('#user');
        const passwordInput = await $('#password');

        await userNameInput.setValue('Pintilei Elena'); 
        await passwordInput.setValue('testtrello'); 

        const loginButton = await $('#login');
        await loginButton.click();

        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/boards'),
            {
                timeout: 5000,
                timeoutMsg: 'Expected to be on the dashboard after login'
            }
        );

        const dashboardElement = await $('selector-for-dashboard-element'); 
        expect(await dashboardElement.isDisplayed()).toBe(true);
    });
           
     it('T3- Should update the profile information correctly', async function() {
        await browser.url('/login');
        await browser.loginAsUser(); 
        await browser.url('/profile/settings'); 

        const uploadInput = await $('#uploadProfilePic');
        const bioInput = await $('#bioTextarea');
        const saveButton = await $('#saveProfileButton');

    
        await uploadInput.setValue('/path/to/new/picture.jpg');
        await bioInput.setValue('This is a new bio');

    
        await saveButton.click();
        await $('.notification').waitForDisplayed({ timeout: 3000, reverse: false });
        await browser.url('/profile');
        const displayedBio = await $('#bioTextDisplay').getText();
        const profileImageSrc = await $('#profileImage').getAttribute('src');

    
        expect(displayedBio).toEqual('This is a new bio');
        expect(profileImageSrc).toContain('path/to/new/picture.jpg');

    after(async function() {
        await browser.logoutUser();
    });                       
    });

   
    it('T4-should allow a user to create a new board', async function() {
        await browser.url('/login');
        await browser.loginAsUser(); 
        await browser.url('/dashboard');

    
        const createBoardButton = await $('#createNewBoard'); 
        await createBoardButton.click();

        const createBoardModal = await $('#createBoardModal');
        await createBoardModal.waitForDisplayed();
        const boardNameInput = await $('#boardNameInput');
        const privacyDropdown = await $('#privacyDropdown');
        const createButton = await $('#createBoardButton');

        const boardName = `Board-${Date.now()}`; 
        await boardNameInput.setValue(boardName);
        await privacyDropdown.selectByVisibleText('Private');

        await createButton.click();
        await $('#boardCreatedSuccessMessage').waitForDisplayed();
        await browser.url('/dashboard');
        const boardList = await $('#boardList');
        const newBoard = await boardList.$(`//*[contains(text(), "${boardName}")]`);

        expect(await newBoard.isDisplayed()).toBe(true);
    });

    after(async function() {
        await browser.logoutUser(); 
    });

    
    it('T5-should allow a user to search for an existing board by name', async function() {
        await browser.url('/login');
        await browser.loginAsUser(); 
        await browser.url('/dashboard');
        const boardName = 'ExistingBoard';

        const searchInput = await $('#searchInput');
        await searchInput.waitForDisplayed();
        await searchInput.setValue(boardName);

    
        await browser.keys('Enter');
        const searchResults = await $('#searchResults');
        await searchResults.waitForDisplayed();

        const boardInResults = await searchResults.$(`//*[contains(text(), "${boardName}")]`);
        expect(await boardInResults.isDisplayed()).toBe(true);
        
        await boardInResults.click();
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes(boardName.toLowerCase()),
            {
                timeout: 5000,
                timeoutMsg: 'Expected to navigate to the board page'
            }
        );
    });

    after(async function() {
        await browser.logoutUser(); 
    });
    
    it('T6-should allow a user to add a list to an existing board', () => {
       
        $('#addAListButton').click();
        const listNameInput = $('#listNameInput');
        listNameInput.waitForDisplayed();
        listNameInput.setValue('New List');
        $('#saveListButton').click();
        const newList = $(`//*[text()="New List"]`);
        assert.strictEqual(newList.isExisting(), true, 'The new list should be added to the board');
      });

    it('T7-should allow a user to add a card to a list with a title and description', () => {
        
       cartButton= $('.list .addCardButton').click(); 
        const titleInput = $('#titleInput');
        titleInput.waitForDisplayed();
        titleInput.setValue('New Card Title');
        const descriptionInput = $('#descriptionInput');
        descriptionInput.setValue('New Card Description');
        $('#addCardButton').click();
        const newCard = $(`//*[text()="New Card Title"]`);
        newCard.waitForExist();
        assert.strictEqual(newCard.getText(), 'New Card Title', 'The card title should match the entered title');
    
        const newCardDescription = $(`//*[contains(text(), "New Card Description")]`);
        assert.strictEqual(newCardDescription.isExisting(), true, 'The card description should match the entered description');
      });

    it('T8-should allow an admin to update the workspace name and permissions', () => {

        const workspaceNameInput = $('#workspaceNameInput');
        workspaceNameInput.waitForDisplayed();
        workspaceNameInput.clearValue();
        workspaceNameInput.setValue('Updated Workspace Name');

        const permissionsSelect = $('#permissionsSelect');
        permissionsSelect.selectByVisibleText('Read-Only'); 
        $('#updateSettingsButton').click();
    
        browser.pause(2000);

        const updatedWorkspaceName = $('#workspaceName');
        assert.strictEqual(updatedWorkspaceName.getText(), 'Updated Workspace Name', 'Workspace name should be updated');
    
        const appliedPermissions = $('#appliedPermissions');
        assert.strictEqual(appliedPermissions.getText(), 'Read-Only', 'Permissions should be set to Read-Only for all members');
      });
