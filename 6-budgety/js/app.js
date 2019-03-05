// Budget controller
var budgetController = (function(){
    var Expense  = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income  = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });

        data.totals[type] = sum;
    };


    var data = {
        allItems :{
            exp: [],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    };

    // Public return
    return {
        // Add new item to the data object
        addItem : function(type,des, val){
            var newItem, ID;

            // create new id.
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }

            // create new item based on 'inc' or 'exp' type.
            if(type === 'exp'){
                newItem = new Expense(ID, des,val);
            }else if(type === 'inc'){
                newItem = new Income(ID, des,val);
            }

            // push it into our data structure.
            data.allItems[type].push(newItem);

            // return the new element.
            return newItem;
        },
        // delete specific item from the data structure
        deleteItem: function(type, id){
            var ids, index;
            // extract all ids of the certain type
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            // extract the index of certain id
            index = ids.indexOf(id);
            
            // delete the item form the data structure
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        // Calculate the total budged
        calculateBudget: function(){
            // calculate total incomes and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },
        calculatePercentages:function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });

            return allPerc;
        },
        getBudget : function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing: function(){
            console.log(data);
        }
    };

})();


// UI controller
var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inpurBtn : '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
    }

    var formatNumber = function(num,type){
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        
        if(int.length>3){
            int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3); 
        }
        
        dec = numSplit[1];

        

        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec ;

    };

    var nodeListForEach = function(list, callback){
        for(var i = 0 ;i<list.length; i++){
            callback(list[i],i);
        }
    };

    return {
        getInput : function(){
            return {
                type : document.querySelector(DOMstrings.inputType).value,
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem : function(obj, type){
            var html, newHtml, element;
            
            // Create HTML strings with placeholder text        
            
            if (type === 'inc'){
                
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type === 'exp'){

                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            // Replace the placeholder text with some actual data

            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

        },
        // Delete item from the DOM
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        // Clear fields after input data
        clearFields: function(){
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', '+ DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current,index,array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },
        displayBudget: function(obj){
            var type;
            
            obj.budget>0 ? type='inc' : type='exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage>0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields,function(current, index){
                if(percentages[index]>0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
        },
        displayMonth: function(){
            var now ,year , month;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
            
        },
        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inpurBtn).classList.toggle('red');

        },
        getDOMstrings : function(){
            return DOMstrings;
        }
    };
})();


// Main App controller
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListners = function(){
        var DOM = UICtrl.getDOMstrings();   
        
        document.querySelector(DOM.inpurBtn).addEventListener('click',ctrlAddItem);
        
        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();           
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);

    }

    // update the budget
    var updateBudget = function(){

        // 1. calculate the budget
        budgetCtrl.calculateBudget()

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget in the UI
        UIController.displayBudget(budget);
        
    };
    
    // update percentages of each expense
    var updatePercentage= function(){
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI
        UICtrl.displayPercentages(percentages);

    };
    
    var ctrlAddItem = function(){
        
        var input, newItem ;
        
        // 1. Get the input field
        input = UICtrl.getInput();
        /* console.log(input);*/
        
        if(input.description !=="" && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller
            newItem =  budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the field
            UICtrl.clearFields();

            // 5. Calculate the budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function(event){
        var itemID ,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            // 1. Parse type and id
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 2. delete the item form the data structure
            budgetCtrl.deleteItem(type,ID);

            // 3. delete the item from the user interdace
            UICtrl.deleteListItem(itemID);

            // 4. update and show the new budget
            updateBudget();

            // 5. Calculate and update percentages
            updatePercentage();

        }
    };


    return {
        init : function(){
            /* console.log('start test'); */
            UIController.displayMonth();
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListners();
        }
    };

})(budgetController,UIController);




controller.init();