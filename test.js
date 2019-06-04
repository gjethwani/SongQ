var { validateEmail, validatePassword } = require('./app')
var assert = require('assert')

describe('Email Validation', function() {
    it('Should return false without @', function() {
        assert.equal(validateEmail('gjethwani'), false)
    })
    it('Should return false without .com', function() {
        assert.equal(validateEmail('gjethwani1@gmail'), false)
    })
    it('Should return false without anything before @', function() {
        assert.equal(validateEmail('@gmail.com'), false)
    })
    it('Should return true with my email', function() {
        assert.equal(validateEmail('gjethwani1@gmail.com'), true)
    })
    it('Should return true with something other than gmail', function() {
        assert.equal(validateEmail('gjethwani1@domain.com'), true)
    })
    it('Should return true with something other than .com', function() {
        assert.equal(validateEmail('gjethwani1@gmail.net'), true)
    })
})

describe('Password Validation', function() {
    it('Should return false without lowercase', function() {
        assert.equal(validatePassword('HI888888!'), false)
    })
    it('Should return false without uppercase', function() {
        assert.equal(validatePassword('hi888888!'), false)
    })
    it('Should return false without number', function() {
        assert.equal(validatePassword('Hiiiiiii!'), false)
    })
    it('Should return false without special character', function() {
        assert.equal(validatePassword('Hiiiiiii8'), false)
    })
    it('Should return shorter than 8 characters', function() {
        assert.equal(validatePassword('Hiii8!'), false)
    })
    it('Should return true with correct password', function() {
        assert.equal(validatePassword('Hiiiiii8!!'), true)
    })
})