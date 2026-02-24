const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultContainer = document.getElementById('meal-result');
const statusContainer = document.getElementById('status-container');

const fetchMeals = async () => {
    const query = searchInput.value.trim();
    if (!query) return;

    // UI State: Loading
    resultContainer.innerHTML = '';
    statusContainer.innerHTML = '<div class="loader"></div>';

    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await response.json();

        statusContainer.innerHTML = '';

        if (!data.meals) {
            statusContainer.innerHTML = `<p>No recipes found for "${query}". Try "Chicken" or "Pasta".</p>`;
            return;
        }

        // Logic: Calculate ingredient count and find the minimum
        const mealWithLeastIngredients = data.meals.map(meal => {
            const ingredients = Object.keys(meal)
                .filter(key => key.includes('strIngredient') && meal[key] && meal[key].trim() !== "")
                .length;
            return { ...meal, ingredientCount: ingredients };
        }).reduce((prev, curr) => (prev.ingredientCount < curr.ingredientCount ? prev : curr));

        renderMeal(mealWithLeastIngredients);

    } catch (error) {
        statusContainer.innerHTML = `<p>Error connecting to API. Please try again later.</p>`;
    }
};

const renderMeal = (meal) => {
    resultContainer.innerHTML = `
        <div class="meal-card">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="meal-info">
                <h3>${meal.strMeal}</h3>
                <p><strong>Category:</strong> ${meal.strCategory}</p>
                <p><strong>Ingredients:</strong> <span class="highlight">${meal.ingredientCount} items</span></p>
                <p style="margin-top:10px; color:#666; font-size:0.9rem;">${meal.strInstructions.substring(0, 180)}...</p>
                <a href="${meal.strYoutube}" target="_blank" style="display:inline-block; margin-top:15px; color:var(--primary); text-decoration:none; font-weight:600;">Watch Tutorial →</a>
            </div>
        </div>
    `;
};

searchBtn.addEventListener('click', fetchMeals);
searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchMeals(); });