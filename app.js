/**
 * !Using module patterns.
 * TODO: Create 3 modules
 * * These three modules are stand alones. 
 * * Hence the don't depend on each other 
 * * This is called seperation of concern.
 * * Better code struct and easy scalability/debugging/portability
 * TODO: 1. To control the Budget/data(backend)
 * TODO: 2. To control the UI(front end)
 * TODO: 3. To control the interaction between em'(connects front-back)
*/

// Understand the concept below and then move to the project.

//  /**
//  * *IIFE is very userful for data privacy 
//  * *IIFE returns an object containing all the functions that are publically
//  * *accessible.
// */
// var budgetController = (function() {
//   /**
//    * *This section has a private scope.
//    * *IIFE popped off the execution stack but due to the power of closures
//    * *We can access the inside decalred functions and variables through the
//    * *publically availabe function.  
//    */
//   // Private Scope
//   ///////////////
//   var x = 25;

//   var add = function(a) {
//       return x + a;
//   }
//   //////////////
//   /**
//    * *This returns an object containing function.
//    * *All the function in the return statement are publically accessible
//    * *just like API's  
//    * *These functions can access the private data/functions.
//    */
//   // Public scope.
//   return {
//       publicTest: function(b) {
//           console.log(add(b));
//       }
//   }
// })();


// BUDGET CONTROLLER
var budgetController = (function() {

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};


	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	
	Expense.prototype.calcPercentage = function(totalIncome) {
		/** Calculates the percentage for every expense */

		if (totalIncome > 0) {
			this.percentage = Math.round((this.value/ totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		/** Returns the percentage */
		return this.percentage;
	};


	var data = {
		allItems: {
		inc: [],
		exp: []
		},

		totals: {
		inc: 0,
		exp: 0
		}, 

		budget: 0,

		percentage: -1
	}

	var calculateTotal = function(type) {
		var sum = 0;

		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});

		data.totals[type] = sum;
	};

	return {
		addItem: function(type, des, val) {
		var newItem, ID;

		// [1, 2, 3, 4], next ID: 6
		// [1, 2, 4, 6, 8], next ID: 9
		// ID: lastID + 1
		if (data.allItems[type].length > 0) {
			ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
		} else {
			ID = 0;
		}

		// creating a new instance 
		if (type === 'exp') {
			newItem = new Expense(ID, des, val);
		} else if (type === 'inc') {
			newItem = new Income(ID, des, val);
		}

		// Storing that instance in our data structure.
		data.allItems[type].push(newItem);

		// Return the new element for the UI to display
		return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index;

			// id = 6
			// data.allItems[type][id]; won't work
			// ids = [1 ,2 ,4, 6, 8]
			// index = 3

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);
			
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}

		},

		calculateBudget: function() {

			// calculate total income
			calculateTotal('inc');

			//calculate total expense
			calculateTotal('exp');

			//calculate the budget income - expense
			data.budget = data.totals.inc - data.totals.exp;

			//calculate the percentage
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}
		},

		calculatePercentage: function() {
			/** callCalculates Percentage */

			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});

		},

		getBudget: function() {
			/**Returns the budget */
			return {
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				budget: data.budget,
				percentage: data.percentage
			};
		},

		getPercentage: function() {
			/**Returns the percentage */
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},

		// TODO: Remove this before DEPLOYING.
		testing: function() {
			console.log(data);
		}
	}
})();


// UI CONTROLLER
var UIController = (function() {

	// All the DOM strings
	DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		expenseContainer: '.expenses__list',
		incomeContainer: '.income__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensePercLabel: '.item__percentage'
	}

	var formatNumber = function(num, type) {
		var numSplit, int, dec, type;
		/*
		+ or - before number
		exactly 2 decimal points
		comma seperating the thousands

		2315.5646 -> + 2,315.56
		2000 -> + 2,000.00
		*/

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');
		
		int = numSplit[0];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
			// input 23510, output 23,510
		}

		dec = numSplit[1];
		
		return (type === 'exp' ? '-' : '+') + ' ' + int + "." + dec;
	};
  
	// Publically accessible methods.
	return {

		getinput: function() {

		// This function should return the object containing the data.
			return {
				type: document.querySelector(DOMstrings.inputType).value, // inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		// Adds the new Item to the UI
		addListItem: function(obj, type) {
		var html, newHtml, element;

		// create a html string with placeholder text
		if (type === 'inc'){

			element = DOMstrings.incomeContainer;
			html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
		} else if (type === 'exp') {

			element = DOMstrings.expenseContainer;
			html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
		}

		// replace the placeholder text with actual obj values
		newHtml = html.replace('%id%', obj.id);
		newHtml = newHtml.replace('%description%', obj.description);
		newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

		// use insertAdjacentHtml to insert HTML through DOM.
		document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function(selectorID) {
			/** Deletes specific item in the list. */

			// In DOM JS to remove an element you need to be in the parent node
			var el = document.getElementById(selectorID)
			el.parentNode.removeChild(el)

		},

		clearFields: function() {
			var fields, fieldsArr;
			
			// querySelectorAll returns a node list 
			fields = document.querySelectorAll(DOMstrings.inputDescription +
						', ' + DOMstrings.inputValue);

			// To convert the list into an array.
			// Use to call method on the slice method that comes under the Array
			// prototype
			fieldsArr = Array.prototype.slice.call(fields);

			// current: current element
			// index: current index
			// array: the array that is being processed 
			fieldsArr.forEach(function(current, index, array) {
				current.value = ""; 
			}); 

			fieldsArr[0].focus();
		},
		
		displayBudget: function(obj) {
			/* Displays the budget to the UI */
			var type;

			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if ( obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = "---";
			}
		},

		displayPercentages: function(percentages) {
			/** Displays percentage of each expense */
			// This will return a node list
			var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

			// Node list has no forEach function so we have to create one for ourselves.
			var nodeListForEach = function(list, callback) {
				for (var i = 0; i < list.length; i++) {
					callback(list[i], i);
				}
			};

			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = "---";
				}
			});

		},

		// This makes the DOMstrings publically accessible.
		getDOMstrings: function(obj, type) {

		return DOMstrings;
		}
	}
})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

	// Function to set up all the event listeners.
	var setUpEventListeners = function() {
		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});
	
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
	};


	var updateBudget = function() {
		/**Updates the budget in 3 simple steps*/

		// TODO: 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// TODO: 2. Display the budget
		var budget = budgetCtrl.getBudget();

		// TODO: 3. Display the budget.
		UICtrl.displayBudget(budget);

	}

	var updatePrecentage = function() {
		/** Updates the percentage in 3 simple steps */

		// TODO: 1. Calculate Percentage.
		budgetCtrl.calculatePercentage();

		// TODO: 2. get Percentage
		var percentages = budgetCtrl.getPercentage();

		// TODO: 3. display Percentage
		UICtrl.displayPercentages(percentages);s


	}


	var ctrlAddItem = function() {

		var input, newItem;

		// TODO: 1. Get the filed input data from the UI
		input = UICtrl.getinput();

		if (input.description !== "" && !isNaN(input.value) && input.value !== 0) {

			// TODO: 2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// TODO: 3. Add the item to UI
			UICtrl.addListItem(newItem, input.type);

			// TODO: 4. Clear the fields
			UICtrl.clearFields();

			// TODO: 5. Calculate and update the budget.
			updateBudget();

			// TODO: 6. Update the percentage
			updatePrecentage();

		}
	}

	var ctrlDeleteItem = function (event) {
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {

			//iteID is of the form: inc-1
			splitID = itemID.split('-');
			type = splitID[0];
			// Use parseInt to turn the string into an integer.
			ID = parseInt(splitID[1]);

			// TODO: 1. Delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);
			
			// TODO: 2. Reflect on the UI
			UICtrl.deleteListItem(itemID);

			// TODO: 3. Update the budget
			updateBudget();

			// TODO: 4. Update the percentage
			updatePrecentage();

		}
	}

	return {
		init: function() {
		console.log("The application has started!");
		UICtrl.displayBudget({
			totalInc: 0,
			totalExp: 0,
			budget: 0,
			percentage: 0
		});
		setUpEventListeners();
		}
	}

})(budgetController, UIController);

controller.init();

