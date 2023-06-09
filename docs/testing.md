# Testing

Testing, in all its forms, is a crucial aspect of software development. It helps create robust code, prevents pushing out broken changes, and helps you identify bugs early on.

## Principles

Good testing practice doesn't start with the test, but with the code being written. In order to have a test-friendly development experience, it is crucial to develop code that follows the [Separation Of Concerns](https://nalexn.github.io/separation-of-concerns/) principle. Ensure each block of code is short and does only a single (simple) task.

Once the code is short and simple, it is easy to devise tests for it.

## Structure

### Folder

All tests should be created in the `tests` directory, and they should end in `.test.js`.

When creating test files, ensure they follow the same hierarchy of the source folder structure. See the example below:

```
/helpers
└───poll.js
/tests
└───/helpers
    └───poll.test.js
```

### Code

When creating tests, ensure there are two `describe` layers before the main testing logic.

1. The first layer identifies the file being tested.
2. The second layer identifies the function being tested.

```
describe("helpers/poll.js tests", function() {
	describe("drawBlock() tests", function() {
		// Tests go here.
	});
	describe("drawSpace() tests", function() {
		// Tests go here.
	});
});
```

## Practice

-  Before making a commit, take a moment to run all tests with `npm test`. Avoid making a commit if the tests do not succeed.
-  Ensure you develop tests alongside the functions you create. The very act of thinking of testing is shown to improve code quality.
