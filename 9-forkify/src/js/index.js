// Global app controller


// ------------------------ Import base elements ------------------------ 
import { elements, renderLoader ,clearLoader} from './views/base';
// ------------------------ end base elements  ------------------------ 



// ------------------------ Import Models ------------------------ 
import Search from './models/Search';
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from './models/Likes';
// ------------------------ End Models ------------------------ 


// ------------------------ Import Views ------------------------ 
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
// ------------------------ End Views ------------------------ 



// ------------------------ Controllers ------------------------ 
// -------------------------------------------------------------



/** Global state of the app
 * - Search object
 * - current recipe object
 * - shopping list object
 * - Liked recipes
 */
const state = {

};

/*testing purpose*/
// window.state = state; 

// ------------------------ End Global state ------------------------ 


/** 
 * Search controller
 */
const controlSearch = async ()=>{
    // 1.get the query from the view
    const query = searchView.getInput();

    // console.log(query);
    

    if(query){
        // A. New search object and add it to state
        state.search = new Search(query);

        // B. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // C. Search for recipes
            await state.search.getResults();

            // D. render results on UI
            // console.log(state.search.result);
            clearLoader();
            searchView.renderResults(state.search.result);
        }catch(error) {
            // console.log('error during searching');
            clearLoader();
        }

    }
};
// ------------------------ End search controller ------------------------ 


/** 
 * Recipe controller
 */

const controlRecipe = async ()=>{
    // Get ID from url
    const id = parseInt(window.location.hash.replace('#',''));
    // console.log(id);
    
    if(id){
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        if(state.search){
            // Highlight selected search item
            searchView.highlightSelected(id);
        }

        // Create new recipe object
        state.recipe = new Recipe(id);
        
        try {
            // Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            
            // render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (error) {
            alert('error');
        }

    }
}
// ------------------------ End recipe controller ------------------------ 


/** 
 * List controller
 */
const controlList = ()=>{
    // create a new list if there is none yet
    if(!state.list) state.list = new List();
    // console.log(state.list);

    // add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};
// ------------------------ End List controller ------------------------ 


/** 
 * Like controller
 */

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    
    // user has not yet liked current recipe
    if(!state.likes.isLiked(currentID)){
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to the UI list
        likesView.renderLike(newLike);
        // console.log(state.likes);

    // user has liked current recipe
    }else{
        // remove like from the state
        state.likes.deleteLike(currentID);

        // toggle the like button
        likesView.toggleLikeBtn(false);

        // remove like from the UI list
        likesView.deleteLike(currentID);
        // console.log(state.likes);        
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


// ------------------------ End Like controller ------------------------ 





// Handle delete and update list item events
elements.shopping.addEventListener('click', e=>{
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);
    // Handle the count update
    }else if(e.target.matches('.shopping__count-value')){
        if(state.list >1 ){
            const val = parseFloat(e.target.value, 10);
            state.list.updateCount(id, val);
        }
    }
});


// window.addEventListener('hashchange',controlRecipe);
// window.addEventListener('load',controlRecipe);


elements.searchForm.addEventListener('submit', e=>{
    e.preventDefault();
    controlSearch();
});

elements.searchPerPages.addEventListener('click',e=>{
    const btn = e.target.closest('.btn-inline');
    // console.log(btn);
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        // console.log(goToPage);
    }
});


['hashchange','load'].forEach(event=>window.addEventListener(event,controlRecipe));

// Handling recipe button clicks
elements.recipe.addEventListener('click',e=>{
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        // decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        // increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        // Add ingredients to the shopping list
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        // Like controller 
        controlLike();
    }
});


window.addEventListener('load', ()=>{
    state.likes = new Likes(); 
    
    // Restore likes
    state.likes.readStorage();
    
    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    // console.log(state);
    state.likes.likes.forEach(like=> likesView.renderLike(like));
    
});
