Components.utils.import("chrome://storm/content/lib/utils.jsm");

var description = 'Tests of the utils lib';

function setUp() {
  // This function is always processed before each test.
  // (ex. creating instances of the class now tested, etc.)
}

function tearDown() {
  // This function is always processed after each test.
  // (ex. destroying instances, etc.)
}

function startUp()
{
  // This function is processed only once before tests.
  // (ex. loading the class you want to test now, etc.)
}

function shutDown()
{
  // This function is processed only once after all tests finish.
}

testWillSuccess.description = 'Test cleanKeyID';
testWillSuccess.priority    = 'normal';
function testCleanKeyID() {
	var cleanedId = cleanKeyID('002830a8',3);
	assert.equals('0A8', cleanedId);
}

// example testcase
testWillSuccess.description = 'Successful test';
testWillSuccess.priority    = 'normal';
function testWillSuccess() {
  assert.equals(0, [].length);
  assert.notEquals(10, ''.length);
  assert.isTrue(true);
  assert.isFalse(false);
  assert.isDefined(assert);
  assert.isUndefined(void(0));
  assert.isNull(null);
  assert.raises('TypeError', (function() { null.property = true; }), this);
  assert.matches(/patterns?/, 'pattern');
}