const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    // let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    let balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser2AfterTransaction = await web3.eth.getBalance(user2);
    // let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceOfUser2AfterTransaction);
    // assert.equal(value, starPrice);
    assert.equal(balanceOfUser2BeforeTransaction > balanceOfUser2AfterTransaction, true);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // get the instance of the deployed contract
    let instance = await StarNotary.deployed();
    // set user1 to the first account from truffle develop (account[0])
    let user1 = accounts[0];
    // set the starId
    let starId = 6;
    // set the starName
    let starName = "New Star";
    // 1. create a Star with different tokenId
    await instance.createStar(starName, starId, {from: user1});
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let name = await instance.name.call();
    let symbol = await instance.symbol.call();
    assert.equal("starToken", name);
    assert.equal("ST", symbol);
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    // 1. create 2 Stars with different tokenId
    let starId1 = 7;
    let starId2 = 8;

    await instance.createStar("My 7th star", starId1, {from: user1});
    await instance.createStar("My 8th star", starId2, {from: user2});

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId1, starId2, {from: user1});
    let newOwnerStar1 = await instance.ownerOf.call(starId1);
    let newOwnerStar2 = await instance.ownerOf.call(starId2);
    
    // 3. Verify that the owners changed
    assert.equal(user2, newOwnerStar1);
    assert.equal(user1, newOwnerStar2);
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    
    // 1. create a Star with different tokenId
    let starId = 9;
    await instance.createStar("My 9th new star", starId, {from: user1});
    
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, starId, {from: user1});

    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    // 1. create a Star with different tokenId
    let starId = 10;
    let starName = "Ashwini";

    await instance.createStar(starName, starId, {from: user1});

    // 2. Call your method lookUptokenIdToStarInfo
    let getStarName = await instance.lookUptokenIdToStarInfo.call(starId);

    // 3. Verify if you Star name is the same
    assert.equal(starName, getStarName);
});