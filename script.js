const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const searchInput = document.getElementById('searchInput');
const resultContainer = document.getElementById('meal-result');
const loader = document.getElementById('loader');

// Helper: Count active ingredients
const countIngredients = (meal) => {
    let count = 0;
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== "") {
            count++;
        }
    }
    return count;
};

// Main Fetch Function
const getMeals = async (isRandom = false) => {
    const query = searchInput.value.trim();
    if (!query && !isRandom) return alert("Enter a dish name!");

    // UI State: Loading
    resultContainer.innerHTML = '';
    loader.classList.remove('loader-hidden');

    const url = isRandom 
        ? `https://www.themealdb.com/api/json/v1/1/random.php`
        : `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        loader.classList.add('loader-hidden');

        if (!data.meals) {
            resultContainer.innerHTML = `<p style="text-align:center; padding:20px;">No recipes found. Try "Pizza" or "Egg".</p>`;
            return;
        }

        // Logic: Find meal with least ingredients
        const finalMeal = data.meals.reduce((min, curr) => {
            return countIngredients(curr) < countIngredients(min) ? curr : min;
        });

        renderMeal(finalMeal);
    } catch (err) {
        loader.classList.add('loader-hidden');
        console.error(err);
    }
};

// Render to UI
const renderMeal = (meal) => {
    const ingredientCount = countIngredients(meal);
    resultContainer.innerHTML = `
        <div class="meal-card">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="meal-info">
                <div class="card-header">
                    <h2>${meal.strMeal}</h2>
                    <button id="shareBtn" class="share-icon-btn">📤</button>
                </div>
                <p><strong>Ingredients:</strong> <span class="highlight">${ingredientCount} items</span></p>
                <p style="margin: 15px 0; color: #555; font-size: 0.95rem;">
                    ${meal.strInstructions.substring(0, 160)}...
                </p>
                <a href="${meal.strYoutube}" target="_blank" class="video-link">View Recipe Video →</a>
            </div>
        </div>
    `;

    document.getElementById('shareBtn').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: meal.strMeal,
                text: `Found the simplest ${meal.strMeal} recipe!`,
                url: meal.strYoutube || window.location.href
            });
        } else {
            alert("Link copied to clipboard!");
            navigator.clipboard.writeText(meal.strYoutube);
        }
    });
};

searchBtn.addEventListener('click', () => getMeals(false));
randomBtn.addEventListener('click', () => getMeals(true));
searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') getMeals(false); });