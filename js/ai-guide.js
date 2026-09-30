/**
 * Somnang - Personalized AI Virtual Food Guide for Khmer Kitchen
 * Trained on Khmer Kitchen's menu, Cambodian heritage, dietary filters, and pairing logic.
 */

class SomnangAIGuide {
  constructor(menuItems, categories, glossary) {
    this.items = menuItems;
    this.categories = categories;
    this.glossary = glossary;
    this.history = [];
  }

  // Generate initial welcome message
  getWelcomeMessage() {
    return {
      sender: 'ai',
      text: `**Choum Reap Sur!** (ជំរាបសួរ) 🙏\n\nI am **Somnang**, your personal Cambodian Food Guide at Khmer Kitchen Bengaluru.\n\nWhether you are curious about authentic Khmer flavors like *Kroeung* and *Fish Amok*, looking for dietary recommendations (Vegan, Gluten-Free), or planning a balanced meal within your budget, I am here to assist you!`,
      dishes: [
        this.items.find(i => i.id === 'fish-amok'),
        this.items.find(i => i.id === 'kroeung-cauliflower-wings')
      ].filter(Boolean),
      suggestions: [
        '🇰🇭 What are the most authentic Cambodian dishes?',
        '👥 Recommend a meal for 2 under ₹1,500',
        '🌱 Show me Vegan & Gluten-Free choices',
        '🌶️ What should I order if I dislike spicy food?',
        '❓ What is Kroeung paste?'
      ]
    };
  }

  // Process user message and return structured response
  processMessage(userText) {
    const text = userText.toLowerCase().trim();
    let replyText = '';
    let matchedDishes = [];
    let suggestions = [];

    // 1. Check for Glossary questions (What is Kroeung, Amok, Na-Taang, Kampot pepper)
    if (text.includes('kroeung') || text.includes('kreoung') || text.includes('paste')) {
      const g = this.glossary.find(item => item.term.includes('Kroeung'));
      replyText = `**Kroeung (គ្រឿង)** is the fragrant heart and soul of Cambodian cuisine! 🌿\n\nUnlike Indian curries that rely heavily on dry powdered spices, Khmer cooking begins with fresh herbs crushed together in a granite mortar: **lemongrass stalks, galangal, kaffir lime leaf, fresh turmeric, shallots, and garlic**.\n\nIt produces an unmistakable golden-yellow, citrusy, and deeply herbaceous aroma with zero harsh pungent heat. Here are our top dishes highlighting fresh Kroeung:`;
      matchedDishes = this.items.filter(i => i.ingredients.some(ing => ing.toLowerCase().includes('kroeung') || ing.toLowerCase().includes('lemongrass')));
      suggestions = ['How spicy is Kroeung?', 'Tell me about Fish Amok', 'Show me all Cambodian signatures'];
    } 
    else if (text.includes('amok') || text.includes('fish amok')) {
      const amok = this.items.find(i => i.id === 'fish-amok');
      replyText = `**Fish Amok (អាម៉ុកត្រី)** is Cambodia's revered National Dish! 👑\n\nInstead of being boiled into a thin soup, fresh fish fillets are gently whipped with yellow kroeung paste, coconut cream, and egg, then spooned into handmade banana leaf cups with noni leaves and steamed. The result is a cloud-like, melt-in-the-mouth curried custard.\n\nIt is mild, aromatic, gluten-free, and pairs wonderfully with **Mekong Jasmine Herb Fried Rice**.`;
      matchedDishes = [amok, this.items.find(i => i.id === 'mekong-fragrant-fried-rice')].filter(Boolean);
      suggestions = ['Is Fish Amok spicy?', 'What else is gluten-free?', 'Recommend appetizers'];
    }
    else if (text.includes('na-taang') || text.includes('natang') || text.includes('dip')) {
      const natang = this.items.find(i => i.id === 'sizzling-na-taang');
      replyText = `**Na-Taang (ណាតាំង)** is a celebratory Cambodian royal dip! 🥥🥜\n\nIt features minced poultry and pork slow-cooked in thick coconut cream, roasted crushed peanuts, palm sugar, and tamarind. It arrives steaming hot with crispy, airy puffed rice crackers for scooping.\n\nIt's rich, nutty, mildly sweet-tangy, and one of the most beloved social dishes in Cambodia!`;
      matchedDishes = [natang];
      suggestions = ['Recommend a drink with Na-Taang', 'Suggest dinner for 2'];
    }
    else if (text.includes('kampot') || text.includes('pepper')) {
      replyText = `**Kampot Pepper** is widely hailed by culinary experts as the finest pepper in the world! 🌾\n\nGrown exclusively in southern coastal Cambodia where quartz-rich soil meets sea breezes, Kampot peppercorns have protected GI status. Unlike common black pepper, Kampot pepper boasts intricate layers of **citrus, eucalyptus, and floral jasmine sweetness**.\n\nAt Khmer Kitchen, we even feature whole fresh green clusters directly on dishes!`;
      matchedDishes = this.items.filter(i => i.name.toLowerCase().includes('kampot') || i.ingredients.some(ing => ing.toLowerCase().includes('kampot')));
      suggestions = ['Tell me about Lok Lak', 'Try Kampot Iced Tea'];
    }
    else if (text.includes('compare') || (text.includes('vs') && (text.includes('amok') || text.includes('khow suey') || text.includes('ramen')))) {
      replyText = `### ⚖️ Comparing Dish Profiles:\n\n* **Fish Amok** (Cambodian): A steamed herbal custard in banana leaf. Gentle, velvety, infused with lemongrass, turmeric & coconut cream. Gluten-free, mild spice (Level 1/3).\n\n* **Burmese Khow Suey** (Asian Bowl): A comforting warm coconut noodle soup with chickpea flour broth, featuring an interactive 8-condiment tray (fried garlic, onions, peanuts, lime) for DIY customization.\n\n* **Recommendation**: If you want an authentic, uniquely Cambodian royal experience, choose **Fish Amok**! If you want a fun, comforting, slurpable noodle bowl with friends, choose **Khow Suey**!`;
      matchedDishes = [this.items.find(i => i.id === 'fish-amok'), this.items.find(i => i.id === 'burmese-khow-suey')].filter(Boolean);
      suggestions = ['What else has noodles?', 'Show vegetarian options'];
    }
    // 2. Budget combinations (Meal for 2 under 1500 or budget)
    else if (text.includes('under') || text.includes('budget') || text.includes('1500') || text.includes('2000') || text.includes('meal for 2') || text.includes('couple') || text.includes('two')) {
      const budgetItems = [
        this.items.find(i => i.id === 'kroeung-cauliflower-wings'), // 425
        this.items.find(i => i.id === 'burmese-khow-suey'), // 565
        this.items.find(i => i.id === 'mango-sticky-rice'), // 385
      ].filter(Boolean);
      const total = budgetItems.reduce((acc, curr) => acc + curr.price, 0);

      replyText = `Here is a curated, perfectly balanced **Feast for 2 under ₹1,500** (Total: **₹${total}**):\n\n1. **Starter**: Kroeung Cauliflower Wings (₹425) - Crunchy & aromatic with lemongrass.\n2. **Main**: Burmese Khow Suey with 8 Condiments (₹565) - Warm, rich & easily shareable.\n3. **Dessert**: Coconut Mango Sticky Rice (₹385) - Warm coconut rice with fresh mango.\n\nThis gives you a complete 3-course journey from crunch to comfort to sweet tropical delight!`;
      matchedDishes = budgetItems;
      suggestions = ['Can you make this non-veg?', 'Suggest drinks under ₹350', 'How to order?'];
    }
    // 3. Dietary: Vegetarian / Vegan
    else if (text.includes('vegan') || text.includes('plant based') || text.includes('dairy free')) {
      const veganItems = this.items.filter(i => i.dietary === 'vegan').slice(0, 4);
      replyText = `Khmer cuisine is naturally fantastic for plant-based diners! Here are our chef-recommended **100% Vegan & Dairy-Free dishes**:\n\n* **Kroeung Cauliflower Wings** - Flash-crisped florets in fragrant lemongrass glaze\n* **Stir-Fried Tofu with Green Kampot Pepper** - Fresh green pepper clusters from Cambodia\n* **Nourishing Buddha Bowl** - Soba noodles, grilled tofu, fresh greens & sesame tahini\n* **Cambodian Mango Sticky Rice** - Sweet glutinous rice simmered in fresh coconut milk`;
      matchedDishes = veganItems;
      suggestions = ['Are these gluten-free too?', 'Show vegetarian baos', 'Mild vegan dishes'];
    }
    else if (text.includes('veg') || text.includes('vegetarian')) {
      const vegItems = this.items.filter(i => i.dietary === 'veg' || i.dietary === 'vegan').slice(0, 4);
      replyText = `We have wonderful pure vegetarian selections! Unlike many pan-Asian restaurants that secretly use fish sauce, our vegetarian dishes are prepared with dedicated plant reductions:\n\n* **Edamame & Truffle Dumpling** - Purple crystal dumplings with truffle oil\n* **Crispy Pan-Fried Beijing Baos** - Fluffy steamed buns with golden crispy bottom\n* **Burmese Khow Suey (Veg)** - Curried coconut broth with 8 DIY toppings\n* **Stir-Fried Tofu with Kampot Peppercorns** - Peppery wok tossed delicacy`;
      matchedDishes = vegItems;
      suggestions = ['Are any of these spicy?', 'Which dessert is vegetarian?', 'Meal for 2 under ₹1500'];
    }
    // 4. Dietary: Gluten-Free
    else if (text.includes('gluten') || text.includes('celiac')) {
      const gfItems = this.items.filter(i => i.isGlutenFree).slice(0, 4);
      replyText = `Many authentic Cambodian recipes naturally rely on rice flour, fresh coconut milk, and tapioca rather than wheat! Here are top **Gluten-Free certified selections**:\n\n* **Fish Amok in Banana Leaf** (Steamed fish custard)\n* **Sizzling Na-Taang** (With puffed rice cakes)\n* **Khmer Chicken & Mango Salad** (Zesty & crisp)\n* **Mekong Jasmine Herb Fried Rice** (Wok tossed fragrant rice)`;
      matchedDishes = gfItems;
      suggestions = ['Is Fish Amok safe for celiac?', 'Gluten free desserts'];
    }
    // 5. Spice tolerance: Mild / Non-spicy / Kids
    else if (text.includes('mild') || text.includes('not spicy') || text.includes('low spice') || text.includes('kids') || text.includes('children') || text.includes('sweet')) {
      const mildItems = this.items.filter(i => i.spiceLevel <= 1).slice(0, 4);
      replyText = `Traditional Cambodian food is famous for being **fragrant and herbal rather than intensely fiery** like Thai or Sichuan food! 🌿\n\nIf you prefer mild, comforting flavors without intense chili heat, these are ideal for you:\n\n* **Fish Amok in Banana Leaf** (Gentle coconut cream & lemongrass custard)\n* **Chicken & Wild Mushroom Clear Soup** (Soothing clear broth)\n* **Edamame & Truffle Dim Sum** (Delicate & aromatic)\n* **Steamed Baby Bok Choy in Garlic Glaze** (Mild & savory)`;
      matchedDishes = mildItems;
      suggestions = ['What drinks pair well?', 'Show full menu', 'Tell me about Amok'];
    }
    // 6. Spice tolerance: Spicy / Fiery / Hot
    else if (text.includes('spicy') || text.includes('hot') || text.includes('fiery') || text.includes('chili')) {
      const spicyItems = this.items.filter(i => i.spiceLevel >= 2).slice(0, 4);
      replyText = `For those who love bold, exciting heat, we recommend these lively dishes:\n\n* **Pork & Kimchi Ramen** (Spicy 12-hour bone broth with aged fermented kimchi)\n* **Malaysian Seafood Laksa** (Fiery coconut sambal broth with tiger prawns)\n* **Kroeung Cauliflower Wings** (Lemongrass & red bird's eye chili glaze)\n* **Classic Lok Lak** (Served with freshly cracked Kampot black pepper & lime dip)`;
      matchedDishes = spicyItems;
      suggestions = ['What drink can cool the heat?', 'Compare Laksa vs Ramen'];
    }
    // 7. Drinks / Beverages / Cocktails
    else if (text.includes('drink') || text.includes('cocktail') || text.includes('mocktail') || text.includes('tea') || text.includes('beverage') || text.includes('bar')) {
      const drinks = this.items.filter(i => i.categoryId === 'desserts-drinks' && i.id !== 'mango-sticky-rice');
      replyText = `Our beverage program pays homage to Cambodian botanicals and the former writing studio of Girish Karnad:\n\n* **Apsarita Signature Infusion** - Bruised lemongrass, kaffir lime, ginger, agave nectar & sparkling soda (Available as Mocktail or Tequila Cocktail).\n* **Kampot Red Pepper Iced Tea** - High-grown artisanal black tea cold-steeped with floral red Kampot peppercorns, honey & slap-bruised mint.`;
      matchedDishes = drinks;
      suggestions = ['Tell me about Apsarita', 'Show sweet desserts'];
    }
    // 8. Authentic Cambodian / Khmer specific
    else if (text.includes('khmer') || text.includes('cambodia') || text.includes('authentic') || text.includes('signature') || text.includes('usp')) {
      const khmerSignatures = this.items.filter(i => i.isKhmerSignature).slice(0, 4);
      replyText = `At Khmer Kitchen Bangalore, our identity is **"Cambodia in India"**. While our Asian bowls offer pan-Asian comfort, our soul lies in authentic Khmer heritage:\n\n* **Fish Amok** - Steamed river fish in banana leaf with yellow kroeung\n* **Sizzling Na-Taang** - Savory peanut-coconut dip with rice crisps\n* **Cambodian Charred Skewers** - Glazed with kroeung & coconut sugar\n* **Lok Lak with Kampot Pepper** - Cambodia’s legendary street steak with lime-pepper dip\n\nWhich of these would you like to explore first?`;
      matchedDishes = khmerSignatures;
      suggestions = ['What is Kroeung?', 'Suggest meal for 2', 'Show all dishes'];
    }
    // 9. Fallback / General search
    else {
      // Search items by keyword
      const keywordMatches = this.items.filter(i => 
        i.name.toLowerCase().includes(text) || 
        i.ingredients.some(ing => ing.toLowerCase().includes(text)) ||
        i.shortDesc.toLowerCase().includes(text)
      );

      if (keywordMatches.length > 0) {
        replyText = `I found **${keywordMatches.length} dish${keywordMatches.length > 1 ? 'es' : ''}** matching "${userText}":`;
        matchedDishes = keywordMatches.slice(0, 4);
      } else {
        replyText = `I would be happy to guide your dining experience! You can ask me:\n\n* "What is **Kroeung** paste?"\n* "Recommend a **meal for 2 under ₹1,500**"\n* "Show **Vegan** and **Gluten-Free** choices"\n* "What dishes are **mild and non-spicy**?"\n* "What is the difference between **Amok** and **Khow Suey**?"`;
        matchedDishes = [
          this.items.find(i => i.id === 'fish-amok'),
          this.items.find(i => i.id === 'burmese-khow-suey')
        ].filter(Boolean);
      }
      suggestions = [
        '🇰🇭 Most authentic dishes',
        '👥 Dinner for 2 under ₹1500',
        '🌱 Vegan recommendations',
        '❓ Explain Kroeung paste'
      ];
    }

    return {
      sender: 'ai',
      text: replyText,
      dishes: matchedDishes,
      suggestions: suggestions
    };
  }
}
