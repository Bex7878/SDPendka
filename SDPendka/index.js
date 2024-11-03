const { createApp, defineComponent } = Vue;

const RecipeList = defineComponent({
    data() {
        return {
            recipes: [],
            newRecipeName: '',
            newRecipeIngredients: '',
            filterIngredient: '',
            sortOption: 'name',
            notifications: [],
            isEditing: false,
            recipeToEdit: null,
        };
    },
    computed: {
        filteredAndSortedRecipes() {
            let filteredRecipes = this.recipes;

            // Filtering by ingredient
            if (this.filterIngredient) {
                const ingredientLower = this.filterIngredient.toLowerCase();
                filteredRecipes = filteredRecipes.filter(recipe =>
                    recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(ingredientLower))
                );
            }

            // Sorting recipes
            if (this.sortOption === 'name') {
                filteredRecipes.sort((a, b) => a.name.localeCompare(b.name));
            } else if (this.sortOption === 'ingredientCount') {
                filteredRecipes.sort((a, b) => a.ingredients.length - b.ingredients.length);
            }

            return filteredRecipes;
        }
    },
    methods: {
        loadRecipes() {
            const storedRecipes = localStorage.getItem('recipes');
            if (storedRecipes) {
                this.recipes = JSON.parse(storedRecipes);
            }
        },
        saveRecipes() {
            localStorage.setItem('recipes', JSON.stringify(this.recipes));
        },
        addOrUpdateRecipe() {
            if (this.newRecipeName && this.newRecipeIngredients) {
                const ingredients = this.newRecipeIngredients.split(',').map(ing => ing.trim());

                if (this.isEditing && this.recipeToEdit) {
                    // Update existing recipe
                    this.recipeToEdit.name = this.newRecipeName;
                    this.recipeToEdit.ingredients = ingredients;
                    this.isEditing = false;
                    this.recipeToEdit = null;
                } else {
                    // Add new recipe
                    const newRecipe = {
                        id: Date.now(),
                        name: this.newRecipeName,
                        ingredients: ingredients
                    };
                    this.recipes.push(newRecipe);
                }
                this.saveRecipes();
                this.notifications.push(`Recipe "${this.newRecipeName}" has been saved.`);
                this.newRecipeName = '';
                this.newRecipeIngredients = '';
            } else {
                alert('Please enter a recipe name and ingredients.');
            }
        },
        deleteRecipe(recipe) {
            this.recipes = this.recipes.filter(r => r.id !== recipe.id);
            this.saveRecipes();
            this.notifications.push(`Recipe "${recipe.name}" has been deleted.`);
        },
        editRecipe(recipe) {
            this.newRecipeName = recipe.name;
            this.newRecipeIngredients = recipe.ingredients.join(', ');
            this.isEditing = true;
            this.recipeToEdit = recipe;
        }
    },
    mounted() {
        this.loadRecipes(); // Load recipes from local storage on mount
    },
    template: `
          <div>
        <!-- Add / Edit Recipe Form -->
        <div class="mb-5">
          <h4>{{ isEditing ? 'Edit Recipe' : 'Add a New Recipe' }}</h4>
          <input type="text" class="form-control mb-2" v-model="newRecipeName" placeholder="Recipe Name" />
          <input type="text" class="form-control mb-2" v-model="newRecipeIngredients" placeholder="Ingredients (comma-separated)" />
          <button class="btn btn-primary" @click="addOrUpdateRecipe">{{ isEditing ? 'Update Recipe' : 'Add Recipe' }}</button>
        </div>

        <!-- Filters and Sorting -->
        <div class="row">
          <div class="col-md-3">
            <h4>Filter Recipes</h4>
            <input type="text" class="form-control" v-model="filterIngredient" placeholder="Enter ingredient" />

            <h4 class="mt-4">Sort Recipes</h4>
            <select class="form-control" v-model="sortOption">
              <option value="name">By Name</option>
              <option value="ingredientCount">By Ingredient Count</option>
            </select>
          </div>

          <!-- Recipes List -->
          <div class="col-md-9">
            <h2 class="mb-4">Recipes</h2>
            <div class="row">
              <div class="col-md-4" v-for="recipe in filteredAndSortedRecipes" :key="recipe.id">
                <div class="card mb-3">
                  <div class="card-body">
                    <h5 class="card-title">{{ recipe.name }}</h5>
                    <p class="card-text"><strong>Ingredients:</strong> {{ recipe.ingredients.join(", ") }}</p>
                    <button class="btn btn-warning btn-sm" @click="editRecipe(recipe)">Edit</button>
                    <button class="btn btn-danger btn-sm" @click="deleteRecipe(recipe)">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications Section -->
        <div class="mt-5">
          <h3>Notifications</h3>
          <ul class="list-group">
            <li class="list-group-item" v-for="(notification, index) in notifications" :key="index">
              {{ notification }}
            </li>
          </ul>
        </div>
      </div>
    `
});

createApp({
    components: {
        RecipeList
    }
}).mount('#app');