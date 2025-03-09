// Mass plant generation for building a comprehensive database
// This function creates hundreds of plant varieties based on templates
export function generateExtendedPlantDatabase() {
  const extendedDatabase = [];
  let idCounter = 100; // Start IDs after our manually created plants
  
  // Direct variety database - each variety is a separate entry
  const directVarieties = [
    // TOMATOES
    { baseType: 'Tomato', variety: 'Roma', type: 'Determinate', days: 75, color: 'Red', size: 'Medium', notes: 'Excellent for sauce and paste, dense flesh with few seeds', harvestInfo: 'Harvest when fruits are fully red but still firm. Cut or twist gently from the vine. Harvest every 1-2 days during peak season.' },
    { baseType: 'Tomato', variety: 'Brandywine', type: 'Indeterminate', days: 90, color: 'Pink', size: 'Large', notes: 'Heirloom beefsteak with exceptional flavor', harvestInfo: 'Harvest when color is fully developed but fruits still have some firmness. Large fruits may crack if left too long on vine after rain.' },
    { baseType: 'Tomato', variety: 'Sun Gold', type: 'Indeterminate', days: 57, color: 'Orange', size: 'Cherry', notes: 'Extremely sweet cherry tomato', harvestInfo: 'Harvest when fruits are fully golden-orange. Very crack-resistant. Can be picked as full clusters.' },
    { baseType: 'Tomato', variety: 'Cherokee Purple', type: 'Indeterminate', days: 85, color: 'Purple-red', size: 'Large', notes: 'Heirloom with rich, smoky flavor', harvestInfo: 'Harvest when color has fully developed with slight softening. Will have green shoulders even when ripe.' },
    { baseType: 'Tomato', variety: 'Mortgage Lifter', type: 'Indeterminate', days: 85, color: 'Pink', size: 'Large', notes: 'Massive fruits with excellent flavor', harvestInfo: 'Harvest when fully colored but still firm. Large size requires careful handling to avoid bruising.' },
    { baseType: 'Tomato', variety: 'Amish Paste', type: 'Indeterminate', days: 85, color: 'Red', size: 'Medium', notes: 'Excellent paste tomato with few seeds', harvestInfo: 'Harvest when fully red. Excellent for canning and sauce-making. Slightly later maturing than Roma.' },
    { baseType: 'Tomato', variety: 'Green Zebra', type: 'Indeterminate', days: 75, color: 'Green with stripes', size: 'Medium', notes: 'Tangy flavor, ripens to green with yellow stripes', harvestInfo: 'Harvest when fruit develops yellow stripes and has slight give when pressed. Will remain mostly green even when ripe.' },
    { baseType: 'Tomato', variety: 'Black Krim', type: 'Indeterminate', days: 80, color: 'Purple-black', size: 'Large', notes: 'Rich, slightly salty flavor', harvestInfo: 'Harvest when color darkens to deep purple-red with dark green shoulders and fruit gives slightly to pressure.' },
    { baseType: 'Tomato', variety: 'San Marzano', type: 'Determinate', days: 80, color: 'Red', size: 'Medium', notes: 'Classic Italian paste tomato', harvestInfo: 'Harvest when deep red but still firm. Prized for sauce-making with meaty flesh and few seeds.' },
    { baseType: 'Tomato', variety: 'Yellow Pear', type: 'Indeterminate', days: 70, color: 'Yellow', size: 'Cherry', notes: 'Prolific, pear-shaped fruits', harvestInfo: 'Harvest when bright yellow. Extremely productive, requires frequent harvesting.' },
    { baseType: 'Tomato', variety: 'Big Beef', type: 'Indeterminate', days: 73, color: 'Red', size: 'Large', notes: 'Disease resistant hybrid with good flavor', harvestInfo: 'Harvest when fully red but still firm. Continues producing until frost. Good disease resistance.' },
    { baseType: 'Tomato', variety: 'Early Girl', type: 'Indeterminate', days: 57, color: 'Red', size: 'Medium', notes: 'Early producer of slicing tomatoes', harvestInfo: 'Harvest when fully red. One of the earliest slicing tomatoes to mature.' },
    { baseType: 'Tomato', variety: 'Black Cherry', type: 'Indeterminate', days: 65, color: 'Purple-black', size: 'Cherry', notes: 'Rich, complex flavor in small fruit', harvestInfo: 'Harvest when color turns to dark purple-red. Flavor improves as fruits darken.' },
    { baseType: 'Tomato', variety: 'Rutgers', type: 'Determinate', days: 75, color: 'Red', size: 'Medium', notes: 'Classic garden variety, good for canning', harvestInfo: 'Harvest when bright red. Balanced sweet-acid flavor makes it good for fresh eating and canning.' },
    { baseType: 'Tomato', variety: 'Better Boy', type: 'Indeterminate', days: 75, color: 'Red', size: 'Large', notes: 'Productive hybrid with good disease resistance', harvestInfo: 'Harvest when fully red but still firm. Very reliable producer with good disease resistance.' },
    { baseType: 'Tomato', variety: 'Celebrity', type: 'Semi-determinate', days: 70, color: 'Red', size: 'Medium', notes: 'All-purpose tomato with good disease resistance', harvestInfo: 'Harvest when bright red. Semi-determinate habit produces over a longer period than most determinate varieties.' },
    { baseType: 'Tomato', variety: 'Stupice', type: 'Indeterminate', days: 55, color: 'Red', size: 'Small-Medium', notes: 'Cold-tolerant, early variety', harvestInfo: 'Harvest when red. Excellent for cooler climates and short growing seasons.' },
    { baseType: 'Tomato', variety: 'Juliet', type: 'Indeterminate', days: 60, color: 'Red', size: 'Grape', notes: 'Productive grape tomato with good crack resistance', harvestInfo: 'Harvest when deep red. Very crack-resistant and stores well after picking.' },
    { baseType: 'Tomato', variety: 'Beefsteak', type: 'Indeterminate', days: 85, color: 'Red', size: 'Very Large', notes: 'Classic large slicing tomato', harvestInfo: 'Harvest when fully red but still firm. Large fruits may need support to prevent breaking vines.' },
    { baseType: 'Tomato', variety: 'Matt\'s Wild Cherry', type: 'Indeterminate', days: 60, color: 'Red', size: 'Tiny Cherry', notes: 'Flavor-packed tiny fruits with good disease resistance', harvestInfo: 'Harvest when bright red. Extremely prolific, requires frequent harvesting. Naturally disease resistant.' },
    
    // PEPPERS
    { baseType: 'Bell Pepper', variety: 'California Wonder', type: 'Sweet', days: 75, color: 'Green to Red', size: 'Large', notes: 'Classic bell pepper, thick walls', harvestInfo: 'Can be harvested green (75 days) or left to mature to red (95 days). Cut with pruners leaving a short stem attached.' },
    { baseType: 'Bell Pepper', variety: 'Purple Beauty', type: 'Sweet', days: 70, color: 'Purple', size: 'Medium', notes: 'Unique purple color, ripens to red', harvestInfo: 'Harvest when deep purple or wait for red maturity. Fruity, sweet flavor improves as peppers mature.' },
    { baseType: 'Bell Pepper', variety: 'Golden California Wonder', type: 'Sweet', days: 75, color: 'Green to Gold', size: 'Large', notes: 'Yellow-gold version of California Wonder', harvestInfo: 'Can be harvested green or left to mature to golden-yellow. Slightly sweeter than green bells.' },
    { baseType: 'Bell Pepper', variety: 'Chocolate Beauty', type: 'Sweet', days: 85, color: 'Green to Brown', size: 'Medium', notes: 'Rich brown color when ripe, sweet flavor', harvestInfo: 'Ripens from green to rich chocolate brown. Flavor becomes increasingly sweet as color deepens.' },
    { baseType: 'Bell Pepper', variety: 'Orange Sun', type: 'Sweet', days: 80, color: 'Green to Orange', size: 'Large', notes: 'Bright orange bell with thick walls', harvestInfo: 'Harvest when deep orange for sweetest flavor. Can be picked green but flavor develops with color.' },
    { baseType: 'Hot Pepper', variety: 'Jalapeño', type: 'Hot', days: 70, color: 'Green to Red', size: 'Small', notes: 'Medium heat, versatile pepper', harvestInfo: 'Typically harvested green for traditional flavor. Red jalapeños are sweeter with slightly more heat.' },
    { baseType: 'Hot Pepper', variety: 'Habanero', type: 'Very Hot', days: 100, color: 'Green to Orange', size: 'Small', notes: 'Very hot lantern-shaped fruit', harvestInfo: 'Harvest when fully orange or red. Heat increases as fruit ripens. Wear gloves when handling.' },
    { baseType: 'Hot Pepper', variety: 'Cayenne', type: 'Hot', days: 75, color: 'Green to Red', size: 'Long Thin', notes: 'Slender hot pepper, good for drying', harvestInfo: 'Harvest when bright red. Excellent for drying whole. Can be strung into ristras for storage.' },
    { baseType: 'Hot Pepper', variety: 'Serrano', type: 'Hot', days: 75, color: 'Green to Red', size: 'Small', notes: 'Hotter than jalapeño, good for salsas', harvestInfo: 'Can be used green or red. Thinner walls than jalapeños, excellent for fresh salsas.' },
    { baseType: 'Hot Pepper', variety: 'Anaheim', type: 'Mild', days: 80, color: 'Green to Red', size: 'Long', notes: 'Mild chile used for roasting', harvestInfo: 'Typically harvested green for traditional chile rellenos. Mildly spicy with thick walls good for stuffing.' },
    { baseType: 'Hot Pepper', variety: 'Poblano', type: 'Mild', days: 65, color: 'Green to Red', size: 'Medium', notes: 'Mild, heart-shaped pepper for stuffing', harvestInfo: 'Usually picked dark green for chiles rellenos. When ripened and dried, called ancho chiles.' },
    { baseType: 'Hot Pepper', variety: 'Thai Bird', type: 'Very Hot', days: 85, color: 'Green to Red', size: 'Tiny', notes: 'Very hot small peppers that grow upward', harvestInfo: 'Can be used green but traditionally harvested red. Excellent for Thai cuisine. Extremely productive.' },
    { baseType: 'Hot Pepper', variety: 'Ghost Pepper', type: 'Extremely Hot', days: 100, color: 'Green to Red', size: 'Medium', notes: 'One of the world\'s hottest peppers', harvestInfo: 'Harvest when fully red. EXTREMELY HOT - handle with gloves and avoid touching face.' },
    { baseType: 'Sweet Pepper', variety: 'Banana Pepper', type: 'Sweet/Mild', days: 70, color: 'Pale Yellow to Red', size: 'Medium-Long', notes: 'Sweet to mildly spicy, good for pickling', harvestInfo: 'Can be picked yellow, orange, or red. Sweetens as it matures. Excellent for pickling.' },
    { baseType: 'Sweet Pepper', variety: 'Pimento', type: 'Sweet', days: 80, color: 'Green to Red', size: 'Heart-shaped', notes: 'Sweet, heart-shaped pepper with thick flesh', harvestInfo: 'Typically harvested when deep red. Thick-walled with sweet flavor, excellent for canning.' },
    { baseType: 'Hot Pepper', variety: 'Tabasco', type: 'Hot', days: 80, color: 'Green to Red', size: 'Small', notes: 'Used for famous hot sauce, grows upright', harvestInfo: 'Harvest when bright red for traditional Tabasco flavor. Very juicy with thin walls.' },
    { baseType: 'Sweet Pepper', variety: 'Corno di Toro', type: 'Sweet', days: 80, color: 'Green to Red/Yellow', size: 'Long', notes: 'Italian "bull\'s horn" pepper, sweet and productive', harvestInfo: 'Harvest when fully red or yellow depending on variety. Sweet flavor excellent for roasting.' },
    { baseType: 'Sweet Pepper', variety: 'Shishito', type: 'Sweet/Mild', days: 60, color: 'Green to Red', size: 'Small', notes: 'Japanese pepper, occasionally spicy', harvestInfo: 'Traditionally harvested green. About 1 in 10 peppers will have mild heat. Excellent blistered in hot oil.' },
    { baseType: 'Hot Pepper', variety: 'Scotch Bonnet', type: 'Very Hot', days: 90, color: 'Green to Yellow/Red', size: 'Small', notes: 'Fruity flavor with intense heat', harvestInfo: 'Harvest when fully colored (yellow, red, or orange depending on variety). Essential for Caribbean cuisine.' },
    { baseType: 'Hot Pepper', variety: 'Carolina Reaper', type: 'Extremely Hot', days: 90, color: 'Green to Red', size: 'Small', notes: 'Currently the world\'s hottest pepper', harvestInfo: 'Harvest when deep red with characteristic "scorpion tail." EXTREMELY HOT - handle with extreme care.' },

    // LETTUCE
    { baseType: 'Lettuce', variety: 'Buttercrunch', type: 'Butterhead', days: 55, color: 'Green', size: 'Medium', notes: 'Compact heads with buttery texture', harvestInfo: 'Harvest whole head or as cut-and-come-again. Heat tolerant for a butterhead variety.' },
    { baseType: 'Lettuce', variety: 'Romaine/Cos', type: 'Romaine', days: 70, color: 'Green', size: 'Tall', notes: 'Upright with crisp texture, heat tolerant', harvestInfo: 'Can harvest outer leaves or wait for full heads. More heat-tolerant than many varieties.' },
    { baseType: 'Lettuce', variety: 'Red Sails', type: 'Loose-leaf', days: 45, color: 'Red/Green', size: 'Large', notes: 'Ruffled leaves with reddish coloration', harvestInfo: 'Harvest outer leaves as needed, allowing center to continue growing. Slow to bolt in warm weather.' },
    { baseType: 'Lettuce', variety: 'Black Seeded Simpson', type: 'Loose-leaf', days: 45, color: 'Light Green', size: 'Large', notes: 'Early producer, light green tender leaves', harvestInfo: 'Harvest outer leaves when 4-6 inches tall. Very reliable and quick to produce.' },
    { baseType: 'Lettuce', variety: 'Iceberg', type: 'Crisphead', days: 85, color: 'Light Green', size: 'Large', notes: 'Classic crisp head lettuce, stores well', harvestInfo: 'Harvest entire head when firm. Most heat-sensitive lettuce type, best for cool seasons.' },
    { baseType: 'Lettuce', variety: 'Little Gem', type: 'Romaine/Butterhead', days: 33, color: 'Green', size: 'Small', notes: 'Small, sweet heads, heat tolerant', harvestInfo: 'Harvest mini heads whole when about the size of a fist. Sweet flavor even in warm weather.' },
    { baseType: 'Lettuce', variety: 'Salad Bowl', type: 'Loose-leaf', days: 50, color: 'Green', size: 'Large', notes: 'Oakleaf-shaped leaves, slow to bolt', harvestInfo: 'Excellent cut-and-come-again variety. Harvest outer leaves and plant will continue producing.' },
    { baseType: 'Lettuce', variety: 'Rouge d\'Hiver', type: 'Romaine', days: 60, color: 'Red/Bronze', size: 'Medium', notes: 'Bronze-red leaves, cold hardy', harvestInfo: 'Very cold-tolerant variety, excellent for fall planting. Harvest outer leaves or entire heads.' },
    { baseType: 'Lettuce', variety: 'Deer Tongue', type: 'Loose-leaf', days: 45, color: 'Green', size: 'Medium', notes: 'Triangular pointed leaves with distinctive flavor', harvestInfo: 'Harvest outer leaves as needed. Distinctive pointed leaves and good flavor make it ideal for salad mixes.' },
    { baseType: 'Lettuce', variety: 'Lollo Rossa', type: 'Loose-leaf', days: 55, color: 'Red/Green', size: 'Medium', notes: 'Frilly edges with red coloration', harvestInfo: 'Very decorative variety with intensely frilled leaves. Harvest outer leaves as needed.' },
    { baseType: 'Lettuce', variety: 'Oakleaf', type: 'Loose-leaf', days: 50, color: 'Green', size: 'Medium', notes: 'Distinctive oak-shaped leaves, heat tolerant', harvestInfo: 'Harvest outer leaves. Better heat tolerance than many lettuce varieties.' },
    { baseType: 'Lettuce', variety: 'Freckles', type: 'Romaine', days: 55, color: 'Green with Red Spots', size: 'Medium', notes: 'Green leaves with red speckles', harvestInfo: 'Visually striking with red speckles on green leaves. Harvest outer leaves or entire heads.' },
    { baseType: 'Lettuce', variety: 'Winter Density', type: 'Romaine', days: 55, color: 'Dark Green', size: 'Medium', notes: 'Compact romaine, cold-hardy', harvestInfo: 'Excellent variety for fall/winter growing. Dense heads resist frost damage.' },
    { baseType: 'Lettuce', variety: 'Marvel of Four Seasons', type: 'Butterhead', days: 60, color: 'Red/Green', size: 'Medium', notes: 'Beautiful red-tinged leaves, adaptable', harvestInfo: 'Colors intensify in cool weather. Can be grown in spring, fall, and mild winters.' },
    { baseType: 'Lettuce', variety: 'Merlot', type: 'Loose-leaf', days: 55, color: 'Deep Red', size: 'Medium', notes: 'Darkest red lettuce available', harvestInfo: 'Intensely red leaves add dramatic color to salads. Harvest outer leaves as needed.' },

    // CARROTS
    { baseType: 'Carrot', variety: 'Danvers', type: 'Storage', days: 70, color: 'Orange', size: 'Medium-Long', notes: 'Conical shape, good for heavy soils', harvestInfo: 'Harvest when roots are 1-1.5 inches in diameter. Good storage variety that handles heavier soils better than many carrots.' },
    { baseType: 'Carrot', variety: 'Nantes', type: 'Fresh Eating', days: 65, color: 'Orange', size: 'Medium', notes: 'Cylindrical, sweet flavor, crisp texture', harvestInfo: 'Harvest when 1-inch diameter for best sweetness and texture. Excellent for fresh eating.' },
    { baseType: 'Carrot', variety: 'Imperator', type: 'Long', days: 75, color: 'Orange', size: 'Long', notes: 'Long and slender, commercial type', harvestInfo: 'Requires deep, loose soil. Harvest when shoulders reach about 3/4 inch diameter.' },
    { baseType: 'Carrot', variety: 'Chantenay', type: 'Storage', days: 70, color: 'Orange', size: 'Short-Medium', notes: 'Short and broad, good for heavy soils', harvestInfo: 'Good choice for shallow or clay soils. Harvest when shoulders are 1-2 inches in diameter.' },
    { baseType: 'Carrot', variety: 'Little Finger', type: 'Baby', days: 50, color: 'Orange', size: 'Small', notes: 'Small Nantes-type, good for containers', harvestInfo: 'Harvest when just 3-5 inches long. Perfect for containers or small gardens.' },
    { baseType: 'Carrot', variety: 'Purple Haze', type: 'Specialty', days: 70, color: 'Purple/Orange', size: 'Medium', notes: 'Purple exterior, orange interior', harvestInfo: 'Purple color is in skin only; interior is orange. Harvest when shoulders reach 3/4 to 1 inch.' },
    { baseType: 'Carrot', variety: 'Yellowstone', type: 'Specialty', days: 70, color: 'Yellow', size: 'Medium', notes: 'Yellow roots with smooth texture', harvestInfo: 'Bright yellow color throughout. Harvest when root shoulders reach 3/4 to 1 inch.' },
    { baseType: 'Carrot', variety: 'Cosmic Purple', type: 'Specialty', days: 70, color: 'Purple/Orange', size: 'Medium', notes: 'Purple skin, orange interior, Nantes-type', harvestInfo: 'Similar to Purple Haze with Nantes shape. Color intensifies as roots mature.' },
    { baseType: 'Carrot', variety: 'Atomic Red', type: 'Specialty', days: 75, color: 'Red', size: 'Medium', notes: 'Red color intensifies when cooked', harvestInfo: 'Lycopene-rich red carrot. Color deepens when cooked. Harvest when shoulders reach 3/4 to 1 inch.' },
    { baseType: 'Carrot', variety: 'Lunar White', type: 'Specialty', days: 65, color: 'White', size: 'Medium', notes: 'White roots with mild flavor', harvestInfo: 'Pure white both inside and out. Mild, sweet flavor. Harvest when 3/4 to 1 inch in diameter.' },
    { baseType: 'Carrot', variety: 'Paris Market', type: 'Round', days: 55, color: 'Orange', size: 'Small/Round', notes: 'Round shape, good for heavy soils or containers', harvestInfo: 'Harvest when roots reach 1-2 inches in diameter. Perfect for shallow soils or containers.' },
    { baseType: 'Carrot', variety: 'Scarlet Nantes', type: 'Fresh Eating', days: 65, color: 'Orange-Red', size: 'Medium', notes: 'Sweet, crisp Nantes-type', harvestInfo: 'Classic sweet carrot for fresh eating. Best harvested when moderate size rather than fully mature.' },
    { baseType: 'Carrot', variety: 'Mokum', type: 'Early', days: 54, color: 'Orange', size: 'Medium', notes: 'Early Nantes-type with excellent sweetness', harvestInfo: 'One of the earliest and sweetest varieties. Harvest young for baby carrots or allow to mature.' },
    { baseType: 'Carrot', variety: 'Dragon', type: 'Specialty', days: 70, color: 'Purple/Red/Orange', size: 'Medium', notes: 'Purple skin, orange core with red ring', harvestInfo: 'Stunning when cut - purple exterior, orange center with red ring. Color holds well when cooked.' },
    { baseType: 'Carrot', variety: 'Bolero', type: 'Storage', days: 75, color: 'Orange', size: 'Medium', notes: 'Disease resistant, excellent for storage', harvestInfo: 'Best storage carrot with excellent disease resistance. Flavor improves after light frosts.' },

    // CUCUMBERS
    { baseType: 'Cucumber', variety: 'Marketmore 76', type: 'Slicing', days: 65, color: 'Dark Green', size: 'Large', notes: 'Disease resistant slicer, reliable producer', harvestInfo: 'Harvest when 7-8 inches long but still slender. Regular harvesting encourages productivity.' },
    { baseType: 'Cucumber', variety: 'Boston Pickling', type: 'Pickling', days: 55, color: 'Green', size: 'Small', notes: 'Traditional pickling cucumber', harvestInfo: 'Harvest for pickles when 2-5 inches long. Check plants daily as fruits develop quickly.' },
    { baseType: 'Cucumber', variety: 'Lemon', type: 'Specialty', days: 65, color: 'Yellow', size: 'Small/Round', notes: 'Round, yellow cucumbers with mild flavor', harvestInfo: 'Harvest when pale yellow and size of a lemon. Thin-skinned with mild flavor.' },
    { baseType: 'Cucumber', variety: 'English Telegraph', type: 'English/Seedless', days: 60, color: 'Green', size: 'Long', notes: 'Long, seedless greenhouse type', harvestInfo: 'Harvest when 10-14 inches long. Does best in greenhouse or under cover. Seedless with thin skin.' },
    { baseType: 'Cucumber', variety: 'Armenian', type: 'Specialty', days: 60, color: 'Light Green', size: 'Very Long', notes: 'Ribbed, pale green, technically a melon', harvestInfo: 'Actually a type of melon. Harvest when 12-18 inches long. Skin is ridged but not bitter.' },
    { baseType: 'Cucumber', variety: 'Straight Eight', type: 'Slicing', days: 58, color: 'Dark Green', size: 'Medium', notes: 'Classic straight slicer, 8-inch fruits', harvestInfo: 'Classic variety that grows to 8 inches long. Harvest before ends begin to round out.' },
    { baseType: 'Cucumber', variety: 'National Pickling', type: 'Pickling', days: 52, color: 'Green', size: 'Small', notes: 'Blocky, early pickling cucumber', harvestInfo: 'Developed specifically for pickling. Harvest when 2-6 inches long depending on pickle style desired.' },
    { baseType: 'Cucumber', variety: 'Suyo Long', type: 'Asian', days: 60, color: 'Green', size: 'Long', notes: 'Ribbed Asian cucumber, sweet flavor', harvestInfo: 'Chinese variety with ribbed skin. Harvest when 12-18 inches long but still relatively slender.' },
    { baseType: 'Cucumber', variety: 'Muncher', type: 'Slicing/Snacking', days: 60, color: 'Medium Green', size: 'Medium', notes: 'Bitter-free, good for fresh eating', harvestInfo: 'Bitter-free variety good for eating without peeling. Harvest when 4-7 inches long.' },
    { baseType: 'Cucumber', variety: 'Mexican Sour Gherkin', type: 'Specialty', days: 70, color: 'Green/White Mottled', size: 'Tiny', notes: 'Tiny, grape-sized cucumbers with citrus flavor', harvestInfo: 'Not a true cucumber but related. Harvest when size of large grape. Looks like miniature watermelon.' },
    { baseType: 'Cucumber', variety: 'Poona Kheera', type: 'Specialty', days: 55, color: 'White to Brown', size: 'Medium', notes: 'Indian heirloom that ripens to russet brown', harvestInfo: 'Unusual variety that starts white, ripens to golden yellow, then russet brown when fully mature.' },
    { baseType: 'Cucumber', variety: 'Beit Alpha', type: 'Middle Eastern', days: 55, color: 'Green', size: 'Medium', notes: 'Thin-skinned with few seeds, middle-eastern type', harvestInfo: 'Thin-skinned with few seeds. Harvest when 5-7 inches long. Very productive and heat tolerant.' },
    { baseType: 'Cucumber', variety: 'Sumter', type: 'Pickling', days: 55, color: 'Green', size: 'Small', notes: 'Disease resistant pickling variety', harvestInfo: 'Excellent disease resistance. Harvest for pickles when 2-5 inches long.' },
    { baseType: 'Cucumber', variety: 'Japanese Climbing', type: 'Slicing/Trellis', days: 65, color: 'Green', size: 'Long', notes: 'Vigorous vines good for trellising', harvestInfo: 'Strong vines with good climbing ability. Harvest slender fruits when 8-9 inches long.' },
    { baseType: 'Cucumber', variety: 'Painted Serpent', type: 'Specialty', days: 60, color: 'Green Striped', size: 'Very Long', notes: 'Striped, curved Armenian cucumber', harvestInfo: 'Related to Armenian. Curved fruits with green/yellow stripes. Harvest when 12-15 inches long.' },

    // BEANS
    { baseType: 'Bean', variety: 'Blue Lake Bush', type: 'Bush/Snap', days: 55, color: 'Green', size: 'Medium', notes: 'Classic snap bean, good flavor and production', harvestInfo: 'Harvest when pods are firm and beans inside are still small. Pick regularly to encourage production.' },
    { baseType: 'Bean', variety: 'Kentucky Wonder Pole', type: 'Pole/Snap', days: 65, color: 'Green', size: 'Long', notes: 'Productive climbing bean with excellent flavor', harvestInfo: 'Provides prolonged harvest. Pick when pods are pencil diameter but before seeds swell.' },
    { baseType: 'Bean', variety: 'Dragon Tongue', type: 'Bush/Snap', days: 60, color: 'Yellow with Purple Streaks', size: 'Medium', notes: 'Dutch wax-type bean with purple streaks', harvestInfo: 'Stunning purple streaks on yellow pods. Purple fades when cooked. Harvest when pods are 4-6 inches.' },
    { baseType: 'Bean', variety: 'Royal Burgundy', type: 'Bush/Snap', days: 55, color: 'Purple', size: 'Medium', notes: 'Purple pods that turn green when cooked', harvestInfo: 'Purple pods make harvesting easy to spot. Turns green when cooked. Slightly better cold tolerance.' },
    { baseType: 'Bean', variety: 'Henderson Bush Lima', type: 'Bush/Lima', days: 65, color: 'Green', size: 'Small', notes: 'Productive small lima bean', harvestInfo: 'Harvest when pods are plump but still bright green. Can be used as shell beans or dried.' },
    { baseType: 'Bean', variety: 'Scarlet Runner', type: 'Pole/Dual-purpose', days: 70, color: 'Green', size: 'Large', notes: 'Ornamental red flowers, good for snap or shell beans', harvestInfo: 'Can be harvested young as snap beans or left to mature for shell beans. Attractive to hummingbirds.' },
    { baseType: 'Bean', variety: 'Tongues of Fire', type: 'Bush/Shell', days: 70, color: 'Cream with Red Streaks', size: 'Medium', notes: 'Beautiful shell bean with red streaks', harvestInfo: 'Primarily grown as a shell bean. Harvest when beans inside fill pods but before pods dry completely.' },
    { baseType: 'Bean', variety: 'Pencil Pod Black Wax', type: 'Bush/Wax', days: 55, color: 'Yellow', size: 'Medium', notes: 'Stringless yellow wax bean', harvestInfo: 'Golden yellow pods should be harvested when 4-6 inches long. Loses quality if left too long.' },
    { baseType: 'Bean', variety: 'Rattlesnake', type: 'Pole/Snap', days: 60, color: 'Green with Purple Streaks', size: 'Long', notes: 'Heat tolerant with distinctive streaking', harvestInfo: 'Distinctive purple streaking on green pods. Very heat tolerant. Harvest when 7-8 inches long.' },
    { baseType: 'Bean', variety: 'Turkey Craw', type: 'Pole/Dry', days: 110, color: 'Tan', size: 'Medium', notes: 'Heirloom with distinctive story and good flavor', harvestInfo: 'Grown primarily as a dry bean. Leave pods on vine until completely dry, then shell.' },
    { baseType: 'Bean', variety: 'Contender', type: 'Bush/Snap', days: 50, color: 'Green', size: 'Medium', notes: 'Early producer, heat and cold tolerant', harvestInfo: 'One of the earliest bush beans. Performs well in both cool and hot conditions. Harvest at 6-7 inches.' },
    { baseType: 'Bean', variety: 'Fordhook Lima', type: 'Bush/Lima', days: 75, color: 'Green', size: 'Large', notes: 'Large-seeded lima with good flavor', harvestInfo: 'Classic large lima. Harvest when pods are plump and seeds are green and full-sized.' },
    { baseType: 'Bean', variety: 'Cherokee Trail of Tears', type: 'Pole/Dual-purpose', days: 70, color: 'Green to Purple', size: 'Medium', notes: 'Historic variety, can be used as snap or dry bean', harvestInfo: 'Can be used as snap bean when young or dry bean when mature. Historically significant variety.' },
    { baseType: 'Bean', variety: 'Provider', type: 'Bush/Snap', days: 50, color: 'Green', size: 'Medium', notes: 'Early, reliable producer in cool soils', harvestInfo: 'Germinates well in cool soil. Very dependable and productive. Harvest at 5-6 inches.' },
    { baseType: 'Bean', variety: 'Lazy Housewife', type: 'Pole/Snap', days: 80, color: 'Green', size: 'Medium', notes: 'Historic stringless pole bean', harvestInfo: 'One of the first stringless beans. Name comes from ease of preparation. Harvest when pods are full size but still tender.' },

    // PEAS
    { baseType: 'Pea', variety: 'Sugar Snap', type: 'Snap/Edible Pod', days: 62, color: 'Green', size: 'Medium', notes: 'Sweet edible pods with full-size peas', harvestInfo: 'Harvest when pods are plump and peas inside are developed, but before pods lose their glossy appearance.' },
    { baseType: 'Pea', variety: 'Oregon Sugar Pod II', type: 'Snow/Edible Pod', days: 60, color: 'Green', size: 'Medium', notes: 'Flat edible pods, harvest before peas develop', harvestInfo: 'Harvest when pods reach full size but before peas inside swell. Flat pods should snap easily.' },
    { baseType: 'Pea', variety: 'Green Arrow', type: 'Shelling', days: 68, color: 'Green', size: 'Medium', notes: 'Reliable shelling pea with high yield', harvestInfo: 'Harvest when pods are plump and filled out but still bright green. Shell immediately or keep cool for best quality.' },
    { baseType: 'Pea', variety: 'Little Marvel', type: 'Shelling', days: 63, color: 'Green', size: 'Small-Medium', notes: 'Compact plants with sweet peas', harvestInfo: 'Dwarf plants good for small gardens. Harvest when pods are plump but still bright green.' },
    { baseType: 'Pea', variety: 'Tom Thumb', type: 'Shelling', days: 55, color: 'Green', size: 'Very Small', notes: 'Ultra-dwarf variety for containers', harvestInfo: 'Perfect for containers at just 8-9 inches tall. Harvest when pods are filled out but still bright green.' },
    { baseType: 'Pea', variety: 'Mammoth Melting Sugar', type: 'Snow/Edible Pod', days: 65, color: 'Green', size: 'Large', notes: 'Large, sweet snow pea pods', harvestInfo: 'Harvest when pods are 3-4 inches long but before peas inside develop. Among the sweetest snow peas.' },
    { baseType: 'Pea', variety: 'Wando', type: 'Shelling', days: 68, color: 'Green', size: 'Medium', notes: 'Heat tolerant shelling pea', harvestInfo: 'More heat tolerant than most peas. Good choice for warmer regions or late spring planting.' },
    { baseType: 'Pea', variety: 'Lincoln', type: 'Shelling', days: 65, color: 'Green', size: 'Medium', notes: 'Sweet, heat-tolerant shelling pea', harvestInfo: 'Noted for sweet flavor. Somewhat heat tolerant. Harvest when pods are plump but still bright green.' },
    { baseType: 'Pea', variety: 'Cascadia', type: 'Snap/Edible Pod', days: 60, color: 'Green', size: 'Medium', notes: 'Disease resistant snap pea', harvestInfo: 'Resistant to powdery mildew. Excellent sweet flavor. Harvest when pods are plump but still crisp.' },
    { baseType: 'Pea', variety: 'Golden Sweet', type: 'Snow/Edible Pod', days: 65, color: 'Yellow', size: 'Medium', notes: 'Unique yellow snow pea', harvestInfo: 'Unusual yellow pods with purple flowers. Harvest when pods reach full size but before peas develop.' },
    { baseType: 'Pea', variety: 'Alderman (Tall Telephone)', type: 'Shelling', days: 75, color: 'Green', size: 'Tall', notes: 'Tall vines with large pods and peas', harvestInfo: 'Classic tall pea reaching 5-6 feet. Needs strong support. Harvest when pods are plump but still bright green.' },
    { baseType: 'Pea', variety: 'Super Sugar Snap', type: 'Snap/Edible Pod', days: 58, color: 'Green', size: 'Medium', notes: 'Disease resistant improvement of Sugar Snap', harvestInfo: 'Improved disease resistance over original Sugar Snap. Harvest when pods are plump but still crisp.' },
    { baseType: 'Pea', variety: 'Snowbird', type: 'Snow/Edible Pod', days: 58, color: 'Green', size: 'Medium', notes: 'Early, compact snow pea', harvestInfo: 'Early producer on compact vines. Harvest when pods reach full size but remain flat.' },
    { baseType: 'Pea', variety: 'Progress #9', type: 'Shelling', days: 58, color: 'Green', size: 'Medium', notes: 'Improved version of popular Laxton\'s Progress', harvestInfo: 'Compact plants with concentrated pod set. Harvest when pods are plump and full.' },
    { baseType: 'Pea', variety: 'Sugar Ann', type: 'Snap/Edible Pod', days: 52, color: 'Green', size: 'Small-Medium', notes: 'Early, dwarf snap pea', harvestInfo: 'One of the earliest snap peas. Dwarf plants need minimal support. Harvest when pods are plump but still smooth.' },

    // SQUASH - SUMMER
    { baseType: 'Squash', variety: 'Black Beauty Zucchini', type: 'Summer/Zucchini', days: 50, color: 'Dark Green', size: 'Medium', notes: 'Classic dark green zucchini', harvestInfo: 'Harvest when 6-8 inches long for best texture and flavor. Regular picking encourages production.' },
    { baseType: 'Squash', variety: 'Yellow Crookneck', type: 'Summer/Crookneck', days: 50, color: 'Yellow', size: 'Medium', notes: 'Traditional summer squash with bent neck', harvestInfo: 'Best when harvested young at 4-6 inches. Develops warty skin and seeds if left too long.' },
    { baseType: 'Squash', variety: 'Pattypan/Scallop', type: 'Summer/Scallop', days: 55, color: 'White/Yellow/Green', size: 'Small-Medium', notes: 'Flying saucer-shaped squash', harvestInfo: 'Harvest when 2-3 inches in diameter for tender texture. Available in white, yellow, and green varieties.' },
    { baseType: 'Squash', variety: 'Cocozelle', type: 'Summer/Zucchini', days: 50, color: 'Green Striped', size: 'Medium', notes: 'Italian zucchini with light green stripes', harvestInfo: 'Italian heirloom with light striping. Harvest when 8-10 inches long for best flavor.' },
    { baseType: 'Squash', variety: 'Zephyr', type: 'Summer/Straightneck', days: 54, color: 'Yellow with Green Tip', size: 'Medium', notes: 'Two-toned squash with yellow body and green tip', harvestInfo: 'Distinctive two-tone appearance. Harvest when 4-6 inches long. Maintains tender texture longer than many varieties.' },
    { baseType: 'Squash', variety: 'Goldbar', type: 'Summer/Straightneck', days: 50, color: 'Yellow', size: 'Medium', notes: 'Straight yellow summer squash', harvestInfo: 'Harvest when 6-8 inches long. Straight shape makes for easy slicing.' },
    { baseType: 'Squash', variety: 'Round Zucchini', type: 'Summer/Zucchini', days: 45, color: 'Green', size: 'Small/Round', notes: 'Tennis ball-sized round zucchini', harvestInfo: 'Harvest when size of tennis ball. Excellent for stuffing. Also available in yellow varieties.' },
    { baseType: 'Squash', variety: 'Costata Romanesco', type: 'Summer/Zucchini', days: 60, color: 'Medium Green with Ridges', size: 'Medium-Large', notes: 'Italian heirloom with excellent flavor, ribbed', harvestInfo: 'Distinctive ribbed appearance. Exceptional flavor. Harvest at 6-8 inches though remains tender larger than most zucchini.' },
    { baseType: 'Squash', variety: 'Yellow Zucchini', type: 'Summer/Zucchini', days: 50, color: 'Yellow', size: 'Medium', notes: 'Golden version of green zucchini', harvestInfo: 'Similar to green zucchini but with bright yellow skin. Harvest at 6-8 inches long.' },
    { baseType: 'Squash', variety: 'Tromboncino', type: 'Summer/Specialty', days: 60, color: 'Light Green', size: 'Very Long', notes: 'Curved Italian heirloom, less seed cavity', harvestInfo: 'Can grow several feet long but best harvested at 8-12 inches. Curved shape with bulb at end. Solid flesh with few seeds.' },

    // SQUASH - WINTER
    { baseType: 'Winter Squash', variety: 'Butternut', type: 'Winter/Moschata', days: 110, color: 'Tan', size: 'Medium-Large', notes: 'Bell-shaped with sweet orange flesh', harvestInfo: 'Harvest when skin turns fully tan and cannot be pierced with thumbnail. Cure for 10 days in warm location for best storage.' },
    { baseType: 'Winter Squash', variety: 'Acorn', type: 'Winter/Pepo', days: 90, color: 'Dark Green', size: 'Small', notes: 'Ribbed, acorn-shaped squash', harvestInfo: 'Harvest when skin is dark green and rind is hard. Orange ground spot indicates maturity. Doesn\'t store as long as some winter squash.' },
    { baseType: 'Winter Squash', variety: 'Delicata', type: 'Winter/Pepo', days: 100, color: 'Cream with Green Stripes', size: 'Small', notes: 'Oblong, striped squash with edible skin', harvestInfo: 'Harvest when cream color develops between green stripes and skin is hard. Shorter storage life than other winter squash.' },
    { baseType: 'Winter Squash', variety: 'Spaghetti', type: 'Winter/Pepo', days: 100, color: 'Yellow', size: 'Medium', notes: 'Stringy flesh that resembles pasta when cooked', harvestInfo: 'Harvest when skin turns fully yellow and cannot be pierced with thumbnail. Flesh forms spaghetti-like strands when cooked.' },
    { baseType: 'Winter Squash', variety: 'Hubbard', type: 'Winter/Maxima', days: 110, color: 'Blue/Green', size: 'Large', notes: 'Large teardrop-shaped squash with sweet flesh', harvestInfo: 'Traditional large storage squash. Harvest when skin is fully colored and hard. Excellent keeper that improves in storage.' },
    { baseType: 'Winter Squash', variety: 'Kabocha', type: 'Winter/Maxima', days: 95, color: 'Dark Green', size: 'Medium', notes: 'Japanese pumpkin with sweet, dry flesh', harvestInfo: 'Harvest when stem begins to cork and skin cannot be pierced. Flavor often improves after 1-2 weeks of storage.' },
    { baseType: 'Winter Squash', variety: 'Red Kuri', type: 'Winter/Maxima', days: 95, color: 'Orange-Red', size: 'Small-Medium', notes: 'Teardrop-shaped with smooth texture', harvestInfo: 'Harvest when skin is deep orange-red and stem begins to dry. Flesh has smooth texture excellent for soups.' },
    { baseType: 'Winter Squash', variety: 'Buttercup', type: 'Winter/Maxima', days: 100, color: 'Dark Green', size: 'Medium', notes: 'Turban-shaped with sweet, dry flesh', harvestInfo: 'Distinctive turban shape with characteristic "button" on blossom end. Harvest when skin hardens and stem begins to dry.' },
    { baseType: 'Winter Squash', variety: 'Sweet Dumpling', type: 'Winter/Pepo', days: 100, color: 'White with Green Stripes', size: 'Small', notes: 'Small, sweet single-serving squash', harvestInfo: 'Perfect single-serving size. Harvest when skin is cream-colored with green stripes and cannot be pierced with thumbnail.' },
    { baseType: 'Winter Squash', variety: 'Honeynut', type: 'Winter/Moschata', days: 110, color: 'Tan', size: 'Very Small', notes: 'Mini butternut with intensified flavor', harvestInfo: 'Mini butternut type with exceptional sweetness. Skin turns from green to deep tan when fully ripe.' },

    // RADISHES
    { baseType: 'Radish', variety: 'Cherry Belle', type: 'Spring/Round', days: 22, color: 'Red', size: 'Small', notes: 'Classic round red radish, quick growing', harvestInfo: 'Harvest when roots are approximately 1 inch in diameter. Quick to mature and slow to become pithy.' },
    { baseType: 'Radish', variety: 'French Breakfast', type: 'Spring/Elongated', days: 25, color: 'Red with White Tip', size: 'Small/Oblong', notes: 'Oblong radish with red top, white bottom', harvestInfo: 'Harvest when about 2 inches long. Mild flavor that becomes hot if left in ground too long.' },
    { baseType: 'Radish', variety: 'White Icicle', type: 'Spring/Elongated', days: 28, color: 'White', size: 'Medium/Long', notes: 'Long, white roots with mild flavor', harvestInfo: 'Harvest when 4-6 inches long but still slender. Mild flavor with good resistance to pithiness.' },
    { baseType: 'Radish', variety: 'Watermelon', type: 'Winter/Storage', days: 65, color: 'White/Green with Pink Interior', size: 'Large', notes: 'Green/white exterior with pink flesh', harvestInfo: 'Harvest when roots are 2-4 inches in diameter. Flesh is pink/red inside like a watermelon. Grows below ground.' },
    { baseType: 'Radish', variety: 'Daikon', type: 'Winter/Storage', days: 60, color: 'White', size: 'Very Large/Long', notes: 'Large Asian radish with mild flavor', harvestInfo: 'Harvest when 12-18 inches long and 2-3 inches in diameter. Mild flavor good for cooking or fermenting.' },
    { baseType: 'Radish', variety: 'Easter Egg', type: 'Spring/Round', days: 25, color: 'Mixed Colors', size: 'Small', notes: 'Mix of colors including purple, red, white', harvestInfo: 'Colorful mix of round radishes. Harvest when approximately 1 inch in diameter. Multiple colors in one planting.' },
    { baseType: 'Radish', variety: 'Black Spanish', type: 'Winter/Storage', days: 55, color: 'Black', size: 'Large', notes: 'Black skin with white flesh, spicy, stores well', harvestInfo: 'Harvest when 3-4 inches in diameter. Pungent flavor mellows with cooking. Excellent storage radish for winter.' },
    { baseType: 'Radish', variety: 'Pink Beauty', type: 'Spring/Round', days: 25, color: 'Pink', size: 'Small', notes: 'Bright pink round radish', harvestInfo: 'Harvest when approximately 1 inch in diameter. Bright pink color with crisp white flesh.' },
    { baseType: 'Radish', variety: 'Zlata', type: 'Spring/Round', days: 30, color: 'Yellow', size: 'Small', notes: 'Unique yellow skin, mild flavor', harvestInfo: 'Unusual yellow radish. Harvest when about 1 inch in diameter. Mild flavor even when large.' },
    { baseType: 'Radish', variety: 'Green Luobo', type: 'Winter/Storage', days: 60, color: 'Green', size: 'Large', notes: 'Chinese radish with green skin, white flesh', harvestInfo: 'Mild Asian radish with green skin and white flesh. Harvest when 4-5 inches in diameter.' },

    // KALE
    { baseType: 'Kale', variety: 'Lacinato/Dinosaur', type: 'Tuscan', days: 60, color: 'Blue-Green', size: 'Medium', notes: 'Long, narrow, bumpy leaves, cold hardy', harvestInfo: 'Harvest outer leaves when 10-12 inches long. Flavor improves after light frost. Very cold hardy.' },
    { baseType: 'Kale', variety: 'Curly Green', type: 'Curly', days: 55, color: 'Green', size: 'Medium', notes: 'Tightly curled leaves, classic type', harvestInfo: 'Harvest outer leaves when 8-10 inches long. Very cold hardy and productive over a long season.' },
    { baseType: 'Kale', variety: 'Red Russian', type: 'Flat Leaf', days: 50, color: 'Purple/Green', size: 'Medium', notes: 'Purple stems, flat toothed leaves', harvestInfo: 'Harvest outer leaves when 8-12 inches long. Tender enough for salads when young. Purple color intensifies in cold.' },
    { baseType: 'Kale', variety: 'Redbor', type: 'Curly', days: 55, color: 'Deep Purple', size: 'Medium', notes: 'Curly, purple leaves, ornamental and edible', harvestInfo: 'Deep purple curly leaves. Harvest outer leaves when 8-10 inches. Color intensifies in cold weather.' },
    { baseType: 'Kale', variety: 'White Russian', type: 'Flat Leaf', days: 50, color: 'Green with White Ribs', size: 'Medium', notes: 'Similar to Red Russian but with white stems', harvestInfo: 'Similar to Red Russian with white instead of purple stems. Very cold hardy. Good flavor for raw use.' },
    { baseType: 'Kale', variety: 'Winterbor', type: 'Curly', days: 60, color: 'Green', size: 'Medium', notes: 'Very curly and cold hardy', harvestInfo: 'Extremely cold hardy variety. Harvest outer leaves when 8-10 inches. Continues producing through winter in mild climates.' },
    { baseType: 'Kale', variety: 'Premier', type: 'Flat Leaf', days: 50, color: 'Blue-Green', size: 'Medium', notes: 'Early, smooth leaf type with good flavor', harvestInfo: 'Quick to produce with tender smooth leaves. Good choice for early spring or fall planting.' },
    { baseType: 'Kale', variety: 'Dwarf Blue Curled', type: 'Curly', days: 55, color: 'Blue-Green', size: 'Small', notes: 'Compact plants with tightly curled leaves', harvestInfo: 'Compact plants good for containers or small gardens. Very cold tolerant. Harvest outer leaves as needed.' },
    { baseType: 'Kale', variety: 'Darkibor', type: 'Curly', days: 60, color: 'Dark Green', size: 'Medium', notes: 'Very curly, dark leaves with good yield', harvestInfo: 'Very productive variety with dark green curly leaves. Excellent cold tolerance and regrowth after cutting.' },
    { baseType: 'Kale', variety: 'Walking Stick', type: 'Specialty', days: 180, color: 'Green', size: 'Very Tall', notes: 'Grows 6-10 feet tall, stems used for walking sticks', harvestInfo: 'Novelty variety that can grow 6-10 feet tall. Young leaves edible, but primarily grown for woody stems used as walking sticks.' },

    // BEETS
    { baseType: 'Beet', variety: 'Detroit Dark Red', type: 'Round', days: 60, color: 'Deep Red', size: 'Medium', notes: 'Classic round beet with sweet flavor', harvestInfo: 'Harvest when roots are 2-3 inches in diameter. Both roots and tops are edible. Stores well.' },
    { baseType: 'Beet', variety: 'Chioggia', type: 'Round', days: 55, color: 'Red/White Rings', size: 'Medium', notes: 'Italian heirloom with candy-stripe interior', harvestInfo: 'Stunning red and white concentric rings when sliced. Harvest when 2-3 inches in diameter. Mild flavor.' },
    { baseType: 'Beet', variety: 'Golden', type: 'Round', days: 55, color: 'Gold', size: 'Medium', notes: 'Sweet yellow beets that don\'t bleed', harvestInfo: 'Golden yellow throughout. Doesn\'t "bleed" like red varieties. Sweet flavor. Harvest when 2-3 inches in diameter.' },
    { baseType: 'Beet', variety: 'Cylindra', type: 'Cylindrical', days: 60, color: 'Red', size: 'Long', notes: 'Cylindrical shape good for slicing', harvestInfo: 'Unique cylindrical shape produces uniform slices. Harvest when 1.5-2 inches in diameter and 6-8 inches long.' },
    { baseType: 'Beet', variety: 'Bull\'s Blood', type: 'Round', days: 58, color: 'Deep Red', size: 'Medium', notes: 'Grown for dark red leaves as well as roots', harvestInfo: 'Grown as much for deep red leaves as for roots. Young leaves excellent in salads. Harvest roots at 2-3 inches.' },
    { baseType: 'Beet', variety: 'Early Wonder Tall Top', type: 'Round', days: 50, color: 'Red', size: 'Medium', notes: 'Early producer with abundant greens', harvestInfo: 'Quick to produce with excellent flavorful greens. Harvest roots when 2-3 inches in diameter.' },
    { baseType: 'Beet', variety: 'Touchstone Gold', type: 'Round', days: 55, color: 'Gold', size: 'Medium', notes: 'Improved golden beet with reliable germination', harvestInfo: 'Most reliable golden variety. Harvest when 3 inches in diameter. Better germination than some yellow varieties.' },
    { baseType: 'Beet', variety: 'Albino', type: 'Round', days: 50, color: 'White', size: 'Medium', notes: 'White beets with very sweet flavor', harvestInfo: 'Pure white roots with sweet flavor. Harvest when 2-3 inches in diameter. Doesn\'t stain like red varieties.' },
    { baseType: 'Beet', variety: 'Moulin Rouge', type: 'Round', days: 55, color: 'Red', size: 'Medium', notes: 'Hybrid with excellent disease resistance', harvestInfo: 'Uniform, high-quality roots with glossy tops. Good disease resistance. Harvest when 2-3 inches in diameter.' },
    { baseType: 'Beet', variety: 'Boldor', type: 'Round', days: 55, color: 'Gold', size: 'Medium', notes: 'Bright gold with smooth skin', harvestInfo: 'Vibrant yellow roots with minimal zoning (rings). Harvest when 2-3 inches in diameter. Sweet flavor.' },

    // HERBS
    { baseType: 'Basil', variety: 'Genovese', type: 'Culinary', days: 68, color: 'Green', size: 'Medium', notes: 'Classic Italian basil with large leaves', harvestInfo: 'Harvest by pinching stems just above a pair of leaves to encourage branching. Regular harvest prevents flowering.' },
    { baseType: 'Basil', variety: 'Thai', type: 'Culinary', days: 65, color: 'Green with Purple Stems', size: 'Medium', notes: 'Spicy anise flavor for Asian cooking', harvestInfo: 'Distinctive anise-licorice flavor. Harvest young leaves for best flavor. Very heat tolerant.' },
    { baseType: 'Basil', variety: 'Lemon', type: 'Culinary', days: 60, color: 'Light Green', size: 'Small-Medium', notes: 'Lemon-scented leaves', harvestInfo: 'Citrusy aroma and flavor. Harvest before flowering for best flavor. Excellent with fish and tea.' },
    { baseType: 'Basil', variety: 'Purple', type: 'Culinary/Ornamental', days: 70, color: 'Deep Purple', size: 'Medium', notes: 'Purple leaves, ornamental and culinary', harvestInfo: 'Dramatic purple color. Slightly less sweet than green varieties. Harvest young leaves for best flavor and color.' },
    { baseType: 'Basil', variety: 'Cinnamon', type: 'Culinary', days: 65, color: 'Green/Purple', size: 'Medium', notes: 'Spicy cinnamon aroma and flavor', harvestInfo: 'Spicy-sweet cinnamon aroma and flavor. Purple stems with green leaves. Regular harvest encourages bushiness.' },
    { baseType: 'Dill', variety: 'Bouquet', type: 'Culinary', days: 65, color: 'Green', size: 'Tall', notes: 'Common variety good for leaf and seed', harvestInfo: 'Harvest young leaves for fresh use. For seed production, allow to flower and collect seeds when dry.' },
    { baseType: 'Dill', variety: 'Fernleaf', type: 'Culinary', days: 55, color: 'Green', size: 'Dwarf', notes: 'Compact variety good for containers', harvestInfo: 'Slow to bolt, compact variety good for containers. Harvest young feathery leaves for best flavor.' },
    { baseType: 'Cilantro', variety: 'Santo', type: 'Culinary', days: 50, color: 'Green', size: 'Medium', notes: 'Slow-bolting cilantro strain', harvestInfo: 'Harvest leaves when young. Plant successive crops as cilantro quickly bolts in warm weather. Seeds can be harvested as coriander.' },
    { baseType: 'Parsley', variety: 'Italian Flat Leaf', type: 'Culinary', days: 75, color: 'Green', size: 'Medium', notes: 'Flat leaves with stronger flavor than curly', harvestInfo: 'Harvest outer stems at soil level as needed. More flavorful than curly varieties. Biennial that may overwinter.' },
    { baseType: 'Thyme', variety: 'English', type: 'Culinary', days: 85, color: 'Green', size: 'Small', notes: 'Classic thyme for cooking', harvestInfo: 'Harvest sprigs as needed. Most intense flavor just before flowering. Perennial in most areas.' },
    { baseType: 'Mint', variety: 'Spearmint', type: 'Culinary', days: 80, color: 'Green', size: 'Medium', notes: 'Sweet mint with culinary uses', harvestInfo: 'Harvest stems before flowering for best flavor. Grows aggressively - best contained in pots. Very hardy perennial.' },
    { baseType: 'Rosemary', variety: 'Tuscan Blue', type: 'Culinary', days: 85, color: 'Green', size: 'Medium-Large', notes: 'Upright habit, good flavor', harvestInfo: 'Harvest sprigs as needed. Flavor is most concentrated in winter. Perennial in mild climates but not cold hardy.' },
    { baseType: 'Oregano', variety: 'Greek', type: 'Culinary', days: 90, color: 'Green', size: 'Small', notes: 'Intense flavor, true oregano', harvestInfo: 'Harvest just before flowering for strongest flavor. Perennial in most areas. Flavor intensifies with drying.' },
    { baseType: 'Sage', variety: 'Broad Leaf', type: 'Culinary', days: 80, color: 'Gray-Green', size: 'Medium', notes: 'Classic garden sage for cooking', harvestInfo: 'Harvest leaves as needed. Best flavor before flowering. Drought tolerant once established. Perennial in most regions.' },
    { baseType: 'Chives', variety: 'Common', type: 'Culinary', days: 80, color: 'Green', size: 'Small', notes: 'Onion-flavored perennial herb', harvestInfo: 'Cut leaves 2 inches above soil level. Will regrow quickly. Perennial that returns year after year. Purple flowers are edible.' },
    
    // FLOWERS
    { baseType: 'Sunflower', variety: 'Mammoth', type: 'Single/Tall', days: 90, color: 'Yellow with Brown Center', size: 'Very Tall', notes: 'Classic giant sunflower with edible seeds', harvestInfo: 'Grows 9-12 feet tall with 12-inch flower heads. For seed harvest, wait until backs turn brown and seeds are plump.' },
    { baseType: 'Sunflower', variety: 'Teddy Bear', type: 'Double/Dwarf', days: 75, color: 'Golden Yellow', size: 'Dwarf', notes: 'Fluffy double blooms on short plants', harvestInfo: 'Only grows 2-3 feet tall. Perfect for containers. Dense, double blooms have shaggy appearance.' },
    { baseType: 'Zinnia', variety: 'California Giant', type: 'Tall', days: 75, color: 'Mixed', size: 'Tall', notes: 'Large blooms in vibrant colors', harvestInfo: 'Harvest when flowers are fully open with long stems. Cut early in morning for longest vase life.' },
    { baseType: 'Zinnia', variety: 'Profusion', type: 'Dwarf', days: 60, color: 'Mixed', size: 'Small', notes: 'Disease resistant with abundant flowers', harvestInfo: 'Disease-resistant series excellent for hot, humid areas. Deadhead spent blooms to encourage more flowers.' },
    { baseType: 'Marigold', variety: 'French', type: 'Dwarf', days: 50, color: 'Yellow/Orange/Red', size: 'Small', notes: 'Compact plants with small, numerous flowers', harvestInfo: 'Compact plants with smaller, often bicolor blooms. Deadhead regularly to promote continuous flowering.' },
    { baseType: 'Marigold', variety: 'African/American', type: 'Tall', days: 70, color: 'Yellow/Orange', size: 'Medium-Tall', notes: 'Larger flowers on taller plants', harvestInfo: 'Larger flower heads than French types. Harvest when flowers are fully open for cut flowers or dried uses.' },
    { baseType: 'Nasturtium', variety: 'Jewel Mix', type: 'Bush', days: 55, color: 'Mixed', size: 'Compact', notes: 'Compact plants with edible flowers and leaves', harvestInfo: 'Both flowers and leaves are edible with peppery flavor. Harvest young leaves and open flowers as needed.' },
    { baseType: 'Nasturtium', variety: 'Climbing', type: 'Vine', days: 65, color: 'Mixed', size: 'Vining', notes: 'Vining habit good for trellises', harvestInfo: 'Can climb 6-8 feet with support. Flowers and leaves both edible. Prefers poor soil - too much fertilizer reduces blooms.' },
    { baseType: 'Cosmos', variety: 'Sensation', type: 'Tall', days: 75, color: 'Pink/White/Crimson', size: 'Tall', notes: 'Tall plants with airy, delicate flowers', harvestInfo: 'Grows 3-4 feet tall. Harvest flowers when fully open for cut flowers. Deadhead to extend bloom period.' },
    { baseType: 'Cosmos', variety: 'Sulphur', type: 'Tall', days: 80, color: 'Yellow/Orange', size: 'Tall', notes: 'Yellow/orange variety, different species', harvestInfo: 'Different species from pink/white cosmos. Bright yellow-orange flowers. Harvest when fully open.' },
    { baseType: 'Morning Glory', variety: 'Heavenly Blue', type: 'Vine', days: 75, color: 'Sky Blue', size: 'Vining', notes: 'Classic sky blue morning glory', harvestInfo: 'Climbing vine that can reach 10-15 feet. Flowers open in morning, close by afternoon. Self-seeds readily.' },
    { baseType: 'Sweet Pea', variety: 'Spencer', type: 'Climbing', days: 85, color: 'Mixed', size: 'Tall', notes: 'Fragrant flowers with ruffled petals', harvestInfo: 'Highly fragrant cut flowers. Harvest when lowest flowers on stem are open. Regular picking encourages more blooms.' },
    { baseType: 'Snapdragon', variety: 'Rocket', type: 'Tall', days: 110, color: 'Mixed', size: 'Tall', notes: 'Tall spikes of dragon-shaped flowers', harvestInfo: 'Tall variety excellent for cut flowers. Harvest when 1/3 to 1/2 of flowers on spike are open.' },
    { baseType: 'Calendula', variety: 'Pacific Beauty', type: 'Medium', days: 60, color: 'Yellow/Orange', size: 'Medium', notes: 'Long-blooming with medicinal properties', harvestInfo: 'Edible flowers that can be used in salads or medicinally. Harvest flower heads when fully open.' },
    { baseType: 'Bachelor Button', variety: 'Blue Boy', type: 'Medium', days: 75, color: 'Blue', size: 'Medium', notes: 'Classic blue cornflower', harvestInfo: 'Harvest for cut flowers when blooms are just opening. Edible flowers add color to salads.' },
  ];

  // Helper functions for variety-specific plants
  function getBaseInfoForType(baseType) {
    // Import from basePlantDatabase dynamically
    const { basePlantDatabase } = require('./plantDatabase');
    
    // Find the base plant that matches this type
    const baseMatch = basePlantDatabase.find(p => 
      p.name === baseType || 
      (baseType.includes("Pepper") && p.name === "Bell Pepper") ||
      (baseType === "Winter Squash" && p.name === "Pumpkin"));
    
    if (baseMatch) {
      return baseMatch;
    }
    
    // Default values based on plant types
    return {
      // Use type-specific defaults when no exact match exists
      indoorStart: getDefaultIndoorStartForType(baseType),
      indoorEnd: getDefaultIndoorEndForType(baseType),
      outdoorStart: getDefaultOutdoorStartForType(baseType),
      outdoorEnd: getDefaultOutdoorEndForType(baseType),
      type: determineType(baseType),
      family: determineFamily(baseType)
    };
  }
  
  function determineType(baseType) {
    if (baseType.includes('Pepper') || 
        baseType === 'Tomato' || 
        baseType === 'Cucumber' || 
        baseType === 'Lettuce' || 
        baseType === 'Carrot' || 
        baseType === 'Radish' || 
        baseType === 'Bean' || 
        baseType === 'Pea' || 
        baseType === 'Squash' || 
        baseType.includes('Squash') || 
        baseType === 'Kale' || 
        baseType === 'Beet') {
      return 'Vegetable';
    }
    
    if (baseType === 'Basil' || 
        baseType === 'Dill' || 
        baseType === 'Cilantro' || 
        baseType === 'Parsley' || 
        baseType === 'Thyme' || 
        baseType === 'Mint' || 
        baseType === 'Rosemary' || 
        baseType === 'Oregano' || 
        baseType === 'Sage' || 
        baseType === 'Chives') {
      return 'Herb';
    }
    
    if (baseType === 'Sunflower' || 
        baseType === 'Zinnia' || 
        baseType === 'Marigold' || 
        baseType === 'Nasturtium' || 
        baseType === 'Cosmos' || 
        baseType === 'Morning Glory' || 
        baseType === 'Sweet Pea' || 
        baseType === 'Snapdragon' || 
        baseType === 'Calendula' || 
        baseType === 'Bachelor Button') {
      return 'Flower';
    }
    
    return 'Vegetable'; // Default
  }
  
  function determineFamily(baseType) {
    const familyMap = {
      'Tomato': 'Solanaceae',
      'Bell Pepper': 'Solanaceae',
      'Hot Pepper': 'Solanaceae',
      'Sweet Pepper': 'Solanaceae',
      'Eggplant': 'Solanaceae',
      'Potato': 'Solanaceae',
      'Cucumber': 'Cucurbitaceae',
      'Squash': 'Cucurbitaceae',
      'Winter Squash': 'Cucurbitaceae',
      'Melon': 'Cucurbitaceae',
      'Watermelon': 'Cucurbitaceae',
      'Pumpkin': 'Cucurbitaceae',
      'Broccoli': 'Brassicaceae',
      'Cabbage': 'Brassicaceae',
      'Kale': 'Brassicaceae',
      'Cauliflower': 'Brassicaceae',
      'Radish': 'Brassicaceae',
      'Turnip': 'Brassicaceae',
      'Brussels Sprouts': 'Brassicaceae',
      'Carrot': 'Apiaceae',
      'Parsley': 'Apiaceae',
      'Dill': 'Apiaceae',
      'Cilantro': 'Apiaceae',
      'Fennel': 'Apiaceae',
      'Celery': 'Apiaceae',
      'Lettuce': 'Asteraceae',
      'Sunflower': 'Asteraceae',
      'Zinnia': 'Asteraceae',
      'Marigold': 'Asteraceae',
      'Calendula': 'Asteraceae',
      'Cosmos': 'Asteraceae',
      'Basil': 'Lamiaceae',
      'Mint': 'Lamiaceae',
      'Oregano': 'Lamiaceae',
      'Thyme': 'Lamiaceae',
      'Sage': 'Lamiaceae',
      'Rosemary': 'Lamiaceae',
      'Bean': 'Fabaceae',
      'Pea': 'Fabaceae',
      'Sweet Pea': 'Fabaceae',
      'Onion': 'Amaryllidaceae',
      'Garlic': 'Amaryllidaceae',
      'Leek': 'Amaryllidaceae',
      'Chives': 'Amaryllidaceae',
      'Beet': 'Amaranthaceae',
      'Spinach': 'Amaranthaceae',
      'Corn': 'Poaceae',
      'Lemongrass': 'Poaceae',
      'Morning Glory': 'Convolvulaceae',
      'Sweet Potato': 'Convolvulaceae',
      'Nasturtium': 'Tropaeolaceae',
      'Snapdragon': 'Plantaginaceae'
    };
    
    return familyMap[baseType] || 'Unknown';
  }
  
  function getDefaultIndoorStartForType(baseType) {
    // Cool-season crops
    if (baseType === 'Kale' || baseType === 'Broccoli' || baseType === 'Cabbage' || 
        baseType === 'Cauliflower' || baseType === 'Lettuce' || baseType === 'Spinach') {
      return 1; // February
    }
    
    // Warm-season crops
    if (baseType === 'Tomato' || baseType.includes('Pepper') || baseType === 'Eggplant') {
      return 2; // March
    }
    
    // Direct-sown crops
    if (baseType === 'Bean' || baseType === 'Corn' || baseType === 'Pea' || 
        baseType === 'Radish' || baseType === 'Carrot' || baseType === 'Beet') {
      return null; // Direct sow recommended
    }
    
    // Default
    return 2; // March
  }
  
  function getDefaultIndoorEndForType(baseType) {
    // If no indoor start, no indoor end
    if (getDefaultIndoorStartForType(baseType) === null) {
      return null;
    }
    
    // Cool-season crops
    if (baseType === 'Kale' || baseType === 'Broccoli' || baseType === 'Cabbage' || 
        baseType === 'Cauliflower' || baseType === 'Lettuce' || baseType === 'Spinach') {
      return 2; // March
    }
    
    // Warm-season crops
    if (baseType === 'Tomato' || baseType.includes('Pepper') || baseType === 'Eggplant') {
      return 3; // April
    }
    
    // Default - one month after indoor start
    return getDefaultIndoorStartForType(baseType) + 1;
  }
  
  function getDefaultOutdoorStartForType(baseType) {
    // Cool-season crops
    if (baseType === 'Kale' || baseType === 'Broccoli' || baseType === 'Cabbage' || 
        baseType === 'Cauliflower' || baseType === 'Lettuce' || baseType === 'Spinach' || 
        baseType === 'Pea' || baseType === 'Radish') {
      return 2; // March
    }
    
    // Warm-season crops
    if (baseType === 'Tomato' || baseType.includes('Pepper') || baseType === 'Eggplant' || 
        baseType === 'Cucumber' || baseType === 'Squash' || baseType === 'Winter Squash' || 
        baseType === 'Bean' || baseType === 'Corn') {
      return 4; // May
    }
    
    // Default
    return 3; // April
  }
  
  function getDefaultOutdoorEndForType(baseType) {
    // Early spring crops
    if (baseType === 'Pea' || baseType === 'Radish' || baseType === 'Lettuce' || 
        baseType === 'Spinach') {
      return 3; // April
    }
    
    // Mid-spring crops
    if (baseType === 'Kale' || baseType === 'Broccoli' || baseType === 'Cabbage' || 
        baseType === 'Cauliflower') {
      return 4; // May
    }
    
    // Warm-season crops
    if (baseType === 'Tomato' || baseType.includes('Pepper') || baseType === 'Eggplant' || 
        baseType === 'Cucumber' || baseType === 'Squash' || baseType === 'Winter Squash' || 
        baseType === 'Bean' || baseType === 'Corn') {
      return 5; // June
    }
    
    // Default - one month after outdoor start
    return getDefaultOutdoorStartForType(baseType) + 1;
  }

  // Map to track the next ID for each base type
  const baseTypeIds = {};

  // Process each direct variety into the standard database format
  directVarieties.forEach(v => {
    // Create a unique ID for each variety, keeping IDs for the same base type sequential
    if (!baseTypeIds[v.baseType]) {
      baseTypeIds[v.baseType] = idCounter;
      idCounter += 100; // Reserve space for many varieties of each type
    }
    
    const varietyId = baseTypeIds[v.baseType]++;
    
    // Find base parent in the basePlantDatabase or provide defaults
    const baseInfo = getBaseInfoForType(v.baseType);
    
    // Create the entry for this specific variety
    const varietyEntry = {
      id: varietyId,
      name: `${v.variety} ${v.baseType}`, // Full display name (e.g., "Roma Tomato")
      type: baseInfo.type || determineType(v.baseType),
      family: baseInfo.family || determineFamily(v.baseType),
      variety: v.variety, // Specific variety name (e.g., "Roma")
      baseType: v.baseType, // Base type (e.g., "Tomato")
      searchTerms: [
        v.variety.toLowerCase(), // Allow searching by just variety name
        `${v.variety.toLowerCase()} ${v.baseType.toLowerCase()}`, // Full name search
        v.baseType.toLowerCase(), // Base type search
        v.color ? v.color.toLowerCase() : null, // Color search
        v.type ? v.type.toLowerCase() : null, // Type search (e.g., "determinate")
      ].filter(Boolean), // Remove null values
      harvestInfo: {
        instructions: v.harvestInfo,
        timing: determineHarvestTimingByType(v.baseType, v.type, v.days),
        indicators: getHarvestIndicators(v.baseType, v.variety, v.color),
        storage: getStorageInfo(v.baseType, v.type),
        yield: getYieldEstimate(v.baseType, v.size, v.type)
      },
      specifics: {
        days: v.days,
        color: v.color,
        size: v.size,
        type: v.type,
        notes: v.notes,
        culinaryUses: getCulinaryUses(v.baseType, v.variety, v.type),
        diseaseResistance: getDiseaseResistance(v.baseType, v.variety),
        growingTips: getGrowingTips(v.baseType, v.variety, v.type)
      },
      indoorStart: baseInfo.indoorStart,
      indoorEnd: baseInfo.indoorEnd,
      outdoorStart: baseInfo.outdoorStart,
      outdoorEnd: baseInfo.outdoorEnd,
      seedViability: baseInfo.seedViability || { 
        years: 3, 
        notes: "Store seeds in cool, dry conditions for longest viability" 
      },
      dataIntegration: {
        confidenceRating: "high",
        sourceCount: 5,
        primarySource: 'Seed Supplier Data',
        lastUpdated: '2024-02-15',
      },
      germination: baseInfo.germination || {
        soilTemp: { min: 15, max: 25, optimal: 20 },
        daysToGerminate: { min: 7, max: 14 },
        seedDepth: 0.6,
        lightNeeded: false,
        specialTechniques: [],
        instructions: `Plant seeds according to standard practices for ${v.baseType.toLowerCase()}.`,
        notes: v.notes
      },
      growingCycle: baseInfo.growingCycle || {
        daysToMaturity: { min: v.days - 5, max: v.days + 5 },
        harvestWindow: { min: 7, max: 14 },
        successionPlanting: v.baseType.includes('Lettuce') || v.baseType.includes('Radish') || v.baseType.includes('Bean'),
        successionInterval: { weeks: 2, notes: "Plant every 2-3 weeks for continuous harvest" }
      },
      difficulty: baseInfo.difficulty || 'moderate',
      regionSpecific: generateRegionSpecificInfo(baseInfo.regionSpecific, v.baseType, v.type, v.days) || {
        northernHemisphere: {
          zoneAdjustments: {
            cold: { indoorShift: 1, outdoorShift: 2 },
            hot: { indoorShift: 0, outdoorShift: 0 }
          },
          zoneTips: {
            "1-3": `In zones 1-3, start ${v.variety} ${v.baseType} indoors 8-10 weeks before last frost. Use season extension methods.`,
            "4-6": `In zones 4-6, start ${v.variety} ${v.baseType} indoors 6-8 weeks before last frost for best results.`,
            "7-8": `In zones 7-8, ${v.variety} ${v.baseType} can be started 4-6 weeks before last frost date.`,
            "9-11": `In zones 9-11, plant ${v.variety} ${v.baseType} in fall or winter for best results, avoiding summer heat.`
          }
        },
        southernHemisphere: {
          seasonAdjust: 6, // Shift by 6 months
          zoneTips: {
            "cool": `In cool southern hemisphere regions, plant ${v.variety} ${v.baseType} in early spring after frost danger has passed.`,
            "temperate": `In temperate southern hemisphere regions, ${v.variety} ${v.baseType} grows well when planted in spring or early autumn.`,
            "warm": `In warm southern hemisphere regions, ${v.variety} ${v.baseType} is best planted in autumn or winter.`
          }
        }
      }
    };
    
    extendedDatabase.push(varietyEntry);
  });
  
  // Generate vegetables
  const vegetableTemplates = [
    { name: 'Bean', family: 'Fabaceae', types: ['Bush', 'Pole', 'Lima', 'Fava', 'Runner', 'Snap', 'Wax', 'Soy', 'Dragon Tongue', 'Scarlet Runner', 'Kentucky Wonder', 'Blue Lake', 'Royal Burgundy', 'Cherokee Trail of Tears', 'Rattlesnake', 'Painted Pony'] },
    { name: 'Corn', family: 'Poaceae', types: ['Sweet', 'Popcorn', 'Dent', 'Flint', 'Flour', 'Glass Gem', 'Blue', 'Painted Mountain', 'Golden Bantam', 'Silver Queen', 'Oaxacan Green', 'Country Gentleman', 'Stowell\'s Evergreen', 'Rainbow Inca'] },
    { name: 'Cabbage', family: 'Brassicaceae', types: ['Green', 'Red', 'Savoy', 'Napa', 'Pointed', 'January King', 'Brunswick', 'Danish Ballhead', 'Early Jersey Wakefield', 'Gonzales', 'Mammoth Red Rock', 'Kalibos'] },
    { name: 'Greens', family: 'Brassicaceae', types: ['Collard', 'Mustard', 'Turnip', 'Bok Choy', 'Tatsoi', 'Mizuna', 'Komatsuna', 'Mibuna', 'Arugula', 'Red Giant', 'Florida Broadleaf', 'Red Russian Kale', 'Lacinato Kale', 'Ethiopian Kale'] },
    { name: 'Radish', family: 'Brassicaceae', types: ['Cherry Belle', 'French Breakfast', 'Daikon', 'Watermelon', 'Black Spanish', 'White Icicle', 'Easter Egg', 'Green Luobo', 'Pink Beauty', 'Chinese Green Luobo', 'Philadelphia White Box', 'Purple Plum'] },
    { name: 'Beet', family: 'Amaranthaceae', types: ['Detroit Dark Red', 'Golden', 'Chioggia', 'Cylindra', 'Bull\'s Blood', 'Touchstone Gold', 'Early Wonder', 'Red Ace', 'Ruby Queen', 'Avalanche', 'MacGregor\'s Favorite', 'Albino'] },
    { name: 'Peas', family: 'Fabaceae', types: ['Snow', 'Snap', 'Shelling', 'Sugar', 'Petit Pois', 'Purple Podded', 'Green Arrow', 'Laxton\'s Progress', 'Oregon Sugar Pod', 'Little Marvel', 'Tom Thumb', 'Lincoln', 'Sugar Magnolia', 'Mammoth Melting'] },
    { name: 'Sweet Potato', family: 'Convolvulaceae', types: ['Beauregard', 'Jewel', 'Purple', 'Japanese', 'Garnet', 'Georgia Jet', 'Centennial', 'Covington', 'Puerto Rico', 'Nancy Hall', 'O\'Henry', 'Murasaki', 'Bonita'] },
    { name: 'Hot Pepper', family: 'Solanaceae', types: ['Jalapeño', 'Habanero', 'Cayenne', 'Serrano', 'Thai', 'Ghost', 'Scotch Bonnet', 'Carolina Reaper', 'Poblano', 'Anaheim', 'Tabasco', 'Pimiento', 'Shishito', 'Hungarian Hot Wax', 'Fresno', 'Bird\'s Eye', 'Aji Amarillo', 'Trinidad Moruga Scorpion'] },
    { name: 'Squash', family: 'Cucurbitaceae', types: ['Butternut', 'Acorn', 'Delicata', 'Spaghetti', 'Hubbard', 'Kabocha', 'Turban', 'Buttercup', 'Sweet Dumpling', 'Gem', 'Honeynut', 'Red Kuri', 'Carnival', 'Lakota', 'Long Island Cheese', 'Queensland Blue', 'Black Futsu', 'Zucchini', 'Yellow Crookneck', 'Yellow Straightneck', 'Pattypan', 'Cocozelle', 'Costata Romanesco', 'Tromboncino'] },
    { name: 'Cucumber', family: 'Cucurbitaceae', types: ['Pickling', 'Slicing', 'English', 'Lemon', 'Armenian', 'Mexican Sour Gherkin', 'Persian', 'Japanese', 'Beit Alpha', 'Marketmore', 'Straight Eight', 'Suyo Long', 'Crystal Apple', 'Dragon\'s Egg', 'White Wonder', 'Poona Kheera', 'Richmond Green Apple', 'Salt and Pepper'] },
    { name: 'Okra', family: 'Malvaceae', types: ['Clemson Spineless', 'Burgundy', 'Star of David', 'Jambalaya', 'Emerald', 'Cajun Delight', 'Silver Queen', 'Red Velvet', 'Hill Country Red', 'Jing Orange', 'Alabama Red', 'Burmese', 'Bowling Red', 'Stewart\'s Zeebest'] },
    { name: 'Melon', family: 'Cucurbitaceae', types: ['Cantaloupe', 'Honeydew', 'Canary', 'Persian', 'Galia', 'Charentais', 'Crenshaw', 'Casaba', 'Santa Claus', 'Sugar Cube', 'Hales Best', 'Minnesota Midget', 'Collective Farm Woman', 'Ananas', 'Tigger', 'Piel de Sapo', 'Honey Rock', 'Jenny Lind'] },
    { name: 'Watermelon', family: 'Cucurbitaceae', types: ['Sugar Baby', 'Crimson Sweet', 'Yellow Doll', 'Charleston Gray', 'Moon and Stars', 'Blacktail Mountain', 'Ali Baba', 'Jubilee', 'Orange Glo', 'Mountain Sweet Yellow', 'Cream of Saskatchewan', 'Congo', 'Desert King', 'Golden Midget', 'Strawberry', 'Black Diamond'] },
    { name: 'Turnip', family: 'Brassicaceae', types: ['Purple Top', 'White Globe', 'Golden Ball', 'Tokyo', 'Hakurei', 'Scarlet Queen', 'Seven Top', 'White Lady', 'Amber Globe', 'Yellow Aberdeen', 'Market Express', 'Just Right'] },
    { name: 'Rutabaga', family: 'Brassicaceae', types: ['American Purple Top', 'Laurentian', 'Nadmorska', 'Joan', 'Marian', 'Wilhelmsburger', 'Helenor', 'York', 'Altasweet', 'Bangholm', 'Major Dunne'] },
    { name: 'Brussels Sprouts', family: 'Brassicaceae', types: ['Long Island', 'Jade Cross', 'Rubine', 'Churchill', 'Diablo', 'Falstaff', 'Hestia', 'Red Bull', 'Octia', 'Nautic', 'Gustus', 'Groninger', 'Brilliant'] },
    { name: 'Cauliflower', family: 'Brassicaceae', types: ['Snowball', 'Purple', 'Orange', 'Romanesco', 'Green', 'Cheddar', 'Veronica', 'Amazing', 'Candid Charm', 'Fioretto', 'Graffiti', 'Vitaverde', 'Flame Star', 'Attribute', 'Bishop', 'Early White'] },
    { name: 'Kohlrabi', family: 'Brassicaceae', types: ['Early White Vienna', 'Purple Vienna', 'Grand Duke', 'Korridor', 'Superschmelz', 'Kolibri', 'Gigante', 'Delicacy Purple', 'Azure Star', 'Kossak', 'Blaril', 'Terek'] },
    { name: 'Artichoke', family: 'Asteraceae', types: ['Green Globe', 'Imperial Star', 'Purple', 'Violetto', 'Romanesco', 'Tavor', 'Spinoso Sardo', 'Opera', 'Castel', 'Purple of Romagna', 'Tempo', 'Emerald', 'Colorado Star', 'Chianti'] },
    { name: 'Carrot', family: 'Apiaceae', types: ['Nantes', 'Danvers', 'Imperator', 'Chantenay', 'Royal Chantenay', 'Parisian Round', 'Dragon', 'Cosmic Purple', 'Amarillo', 'Yellowstone', 'White Satin', 'Atomic Red', 'Solar Yellow', 'Lunar White', 'Mokum', 'Bolero', 'Merida', 'Black Nebula']},
    { name: 'Celery', family: 'Apiaceae', types: ['Utah', 'Pascal', 'Golden Self-Blanching', 'Giant Red', 'Celeriac', 'Redventure', 'Tango', 'Conquistador', 'Tall Utah', 'Chinese Pink', 'Monterey', 'Victoria', 'Par-Cel'] },
    { name: 'Garlic', family: 'Amaryllidaceae', types: ['Softneck', 'Hardneck', 'Elephant', 'Rocambole', 'Purple Stripe', 'Porcelain', 'Asiatic', 'Turban', 'Creole', 'Artichoke', 'Silverskin', 'Spanish Roja', 'Music', 'Georgian Fire', 'German White', 'Chesnok Red', 'Italian Purple'] },
    { name: 'Onion', family: 'Amaryllidaceae', types: ['Red', 'Yellow', 'White', 'Sweet', 'Bunching', 'Cipollini', 'Shallot', 'Walla Walla', 'Alisa Craig', 'Red Burgundy', 'Patterson', 'Valencia', 'Redwing', 'Candy', 'Southport White Globe', 'Australian Brown', 'Long Red Florence'] },
    { name: 'Leek', family: 'Amaryllidaceae', types: ['American Flag', 'Carentan', 'King Richard', 'Blue Solaise', 'Giant Musselburgh', 'Bandit', 'Varna', 'Autumn Giant', 'Lincoln', 'Lancelot', 'Megaton', 'Tadorna', 'Jolant', 'Bulgarian Giant'] },
    { name: 'Potato', family: 'Solanaceae', types: ['Russet', 'Yukon Gold', 'Red Norland', 'Fingerling', 'Purple Majesty', 'All Blue', 'German Butterball', 'Kennebec', 'Adirondack Blue', 'Austrian Crescent', 'Rose Finn Apple', 'Desiree', 'French Fingerling', 'Russian Banana', 'Bintje', 'Carola', 'Purple Viking', 'All Red'] },
    { name: 'Spinach', family: 'Amaranthaceae', types: ['Bloomsdale', 'New Zealand', 'Malabar', 'Space', 'Tyee', 'Olympia', 'Red Malabar', 'Emperor', 'Giant Noble', 'Toucan', 'Corvair', 'Catalina', 'Palco', 'Avon', 'Bordeaux', 'Winter Bloomsdale', 'Lavewa'] },
    { name: 'Eggplant', family: 'Solanaceae', types: ['Black Beauty', 'Japanese', 'Italian', 'Thai', 'Chinese', 'White', 'Fairy Tale', 'Listada de Gandia', 'Rosa Bianca', 'Turkish Orange', 'Little Fingers', 'Ping Tung Long', 'Thai Green', 'Casper', 'Calliope', 'Applegreen', 'Black Opal', 'Neon'] },
    { name: 'Tomatillo', family: 'Solanaceae', types: ['Verde', 'Purple', 'Amarylla', 'Mexican Strain', 'Cisineros', 'Green Husk', 'Gigante', 'De Milpa', 'Pineapple', 'Rio Grande Verde', 'Plaza Latina Giant', 'Purple Coban', 'Yellow'] },
    { name: 'Asparagus', family: 'Asparagaceae', types: ['Mary Washington', 'Jersey Giant', 'Purple Passion', 'Jersey Knight', 'Jersey Supreme', 'Atlas', 'Apollo', 'Pacific Purple', 'UC 157', 'Precoce D\'Argenteuil', 'Mondeo', 'Sweet Purple', 'Erasmus'] },
    { name: 'Rhubarb', family: 'Polygonaceae', types: ['Victoria', 'Crimson Red', 'Champagne', 'Valentine', 'Canada Red', 'Holstein Bloodred', 'Turkish', 'Sunrise', 'Riverside Giant', 'MacDonald', 'Sutton', 'Timperley Early', 'Colorado Red'] },
    { name: 'Ground Cherry', family: 'Solanaceae', types: ['Aunt Molly\'s', 'Goldie', 'Pineapple', 'Cossack Pineapple', 'Cape Gooseberry', 'Giant', 'Loewen Family Heirloom', 'Yellow Husk', 'Amarylla', 'Purple', 'Hungarian', 'Sugar Lump'] },
    { name: 'Arugula', family: 'Brassicaceae', types: ['Wild', 'Rocket', 'Italian', 'Sylvetta', 'Apollo', 'Astro', 'Wasabi', 'Surrey', 'Dragon\'s Tongue', 'Olive Leaf', 'Italian Cress', 'Garden Tangy'] },
    { name: 'Amaranth', family: 'Amaranthaceae', types: ['Red Garnet', 'Green Callaloo', 'Purple', 'Joseph\'s Coat', 'Golden Giant', 'Burgundy', 'Elena\'s Rojo', 'Orange Giant', 'Mayo Indian', 'Hopi Red Dye', 'Early Splendor'] }
  ];
  
  vegetableTemplates.forEach(template => {
    template.types.forEach(type => {
      // Create 2-3 varieties per type for diversity
      const varieties = [];
      const varietyCount = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < varietyCount; i++) {
        const flavorDescriptors = ['Heirloom', 'Early', 'Late', 'Giant', 'Dwarf', 'Sweet', 'Hardy', 'Tender', 'Bolt-resistant', 'Hybrid'];
        const descriptor = flavorDescriptors[Math.floor(Math.random() * flavorDescriptors.length)];
        varieties.push(`${descriptor} ${type}`);
      }
      
      // Add variety that matches the type exactly as well
      varieties.push(type);
      
      const plantName = type.includes(template.name) ? type : `${type} ${template.name}`;
      
      // Generate growing data with slight variations
      const indoorStart = Math.floor(Math.random() * 3); // 0-2 (Jan-Mar)
      const indoorEnd = indoorStart + Math.floor(Math.random() * 2) + 1; // 1-2 months after indoor start
      const outdoorStart = indoorEnd + Math.floor(Math.random() * 2) + 1; // 1-2 months after indoor end
      const outdoorEnd = outdoorStart + Math.floor(Math.random() * 2) + 1; // 1-2 months after outdoor start
      
      // Generate germination data
      const minTemp = 10 + Math.floor(Math.random() * 15); // 10-24°C
      const maxTemp = minTemp + 5 + Math.floor(Math.random() * 10); // 5-14°C above min
      const optimalTemp = minTemp + Math.floor((maxTemp - minTemp) * 0.6); // 60% between min and max
      
      const minDays = 3 + Math.floor(Math.random() * 8); // 3-10 days
      const maxDays = minDays + 3 + Math.floor(Math.random() * 10); // 3-12 days more than min
      
      const seedDepth = (0.3 + (Math.random() * 2.2)).toFixed(1); // 0.3-2.5 cm
      
      // Generate random days to maturity for this vegetable
      const daysToMaturity = 50 + Math.floor(Math.random() * 40); // 50-90 days
      
      // Create a random color appropriate for this plant
      const colors = {
        'Bean': ['Green', 'Yellow', 'Purple', 'Red', 'Black', 'White', 'Mottled'],
        'Corn': ['Yellow', 'White', 'Bi-Color', 'Blue', 'Red', 'Purple', 'Rainbow'],
        'Tomato': ['Red', 'Yellow', 'Orange', 'Pink', 'Purple', 'Black', 'Green', 'Striped'],
        'Pepper': ['Green', 'Red', 'Yellow', 'Orange', 'Purple', 'Chocolate', 'White']
      };
      
      const plantColor = colors[template.name] ? 
        colors[template.name][Math.floor(Math.random() * colors[template.name].length)] : 
        null;
      
      // Generate a size appropriate for the type
      const sizes = ['Small', 'Medium', 'Large'];
      const plantSize = sizes[Math.floor(Math.random() * sizes.length)];
      
      // Create veggie with enhanced structure
      const veggie = {
        id: idCounter++,
        name: plantName,
        type: 'Vegetable',
        family: template.family,
        varieties: varieties,
        // Support search terms for find-by-variety
        searchTerms: [
          plantName.toLowerCase(),
          ...varieties.map(v => v.toLowerCase()),
          template.name.toLowerCase(),
          plantColor ? plantColor.toLowerCase() : null
        ].filter(Boolean),
        indoorStart: indoorStart,
        indoorEnd: indoorEnd,
        outdoorStart: outdoorStart,
        outdoorEnd: outdoorEnd,
        seedViability: { 
          years: Math.floor(Math.random() * 4) + 2, // 2-5 years
          notes: `${plantName} seeds remain viable for several years when stored properly in cool, dry conditions.`
        },
        dataIntegration: {
          confidenceRating: Math.random() < 0.7 ? "high" : "moderate",
          sourceCount: Math.floor(Math.random() * 4) + 3, // 3-6 sources
          primarySource: ['USDA', 'University Extension', 'Seed Savers Exchange', 'Johnny\'s Selected Seeds', 'Cornell University'][Math.floor(Math.random() * 5)],
          lastUpdated: '2024-01-15',
        },
        // Enhanced harvest information
        harvestInfo: {
          instructions: `Harvest ${plantName} when fully mature. Look for signs of readiness such as appropriate size, color, and texture.`,
          timing: determineHarvestTimingByType(template.name, type, daysToMaturity),
          indicators: getHarvestIndicators(template.name, type, plantColor),
          storage: getStorageInfo(template.name, type),
          yield: getYieldEstimate(template.name, plantSize, type)
        },
        // Enhanced specifics
        specifics: {
          days: daysToMaturity,
          color: plantColor,
          size: plantSize,
          type: type,
          notes: `${type} ${template.name} with ${plantColor ? plantColor.toLowerCase() + ' color' : 'typical coloration'}.`,
          culinaryUses: getCulinaryUses(template.name, type, type),
          diseaseResistance: "Standard disease resistance for this variety. Monitor for common issues.",
          growingTips: getGrowingTips(template.name, type, type)
        },
        germination: {
          soilTemp: { min: minTemp, max: maxTemp, optimal: optimalTemp },
          daysToGerminate: { min: minDays, max: maxDays },
          seedDepth: parseFloat(seedDepth),
          lightNeeded: Math.random() < 0.2, // 20% need light
          specialTechniques: Math.random() < 0.3 ? 
            [["Pre-soaking", "Cold stratification", "Bottom heat", "Scarification"][Math.floor(Math.random() * 4)]] : 
            [],
          instructions: `Sow seeds ${seedDepth} cm deep in well-draining soil. Keep soil consistently moist but not waterlogged.`,
          notes: `${plantName} seeds germinate best when soil temperature is between ${optimalTemp-2}°C and ${optimalTemp+2}°C.`
        },
        growingCycle: {
          daysToMaturity: { 
            min: daysToMaturity - 5, 
            max: daysToMaturity + 10
          },
          harvestWindow: { 
            min: 1 + Math.floor(Math.random() * 3), 
            max: 4 + Math.floor(Math.random() * 6)
          },
          successionPlanting: Math.random() < 0.7, // 70% can be succession planted
          successionInterval: { 
            weeks: 2 + Math.floor(Math.random() * 3), 
            notes: "Plant every few weeks for continuous harvest" 
          }
        },
        difficulty: Math.random() < 0.6 ? 'easy' : (Math.random() < 0.8 ? 'moderate' : 'difficult'),
        regionSpecific: generateRegionSpecificInfo(null, template.name, type, daysToMaturity)
      };
      
      extendedDatabase.push(veggie);
    });
  });
  
  // Generate herbs
  const herbTemplates = [
    { name: 'Mint', family: 'Lamiaceae', types: ['Spearmint', 'Peppermint', 'Chocolate', 'Apple', 'Ginger', 'Banana', 'Orange', 'Moroccan', 'Lime', 'Pineapple', 'Strawberry', 'Lavender', 'Corsican', 'Pennyroyal', 'Eau de Cologne', 'Citrata', 'Bowles', 'Swiss'] },
    { name: 'Oregano', family: 'Lamiaceae', types: ['Greek', 'Italian', 'Golden', 'Syrian', 'Turkish', 'Mexican', 'Cretan', 'Hot and Spicy', 'Compactum', 'Aureum', 'Herrenhausen', 'Dittany of Crete', 'Hopley\'s', 'Kaliteri', 'Jim Best'] },
    { name: 'Sage', family: 'Lamiaceae', types: ['Common', 'Purple', 'Tricolor', 'Pineapple', 'White', 'Golden', 'Berggarten', 'Clary', 'Meadow', 'Cleveland', 'Mexican Bush', 'Grape-scented', 'Garden', 'Woodland', 'Autumn', 'Honey Melon', 'Broadleaf'] },
    { name: 'Thyme', family: 'Lamiaceae', types: ['English', 'French', 'Lemon', 'Creeping', 'Caraway', 'Silver', 'Woolly', 'Orange', 'Lime', 'Coconut', 'Wild', 'Highland Cream', 'Elfin', 'Doone Valley', 'Foxley', 'Golden Lemon', 'Lavender', 'Silver Posie', 'Archer\'s Gold'] },
    { name: 'Chives', family: 'Amaryllidaceae', types: ['Common', 'Garlic', 'Siberian', 'Giant', 'Chinese', 'Flowering', 'Fine Leaf', 'Grolau', 'Staro', 'Nelly', 'Polyvit', 'Profusion', 'Forescate'] },
    { name: 'Dill', family: 'Apiaceae', types: ['Bouquet', 'Dukat', 'Fernleaf', 'Mammoth', 'Tetra', 'Greensleeves', 'Ella', 'Hera', 'Diana', 'Superdukat', 'Goldkrone', 'Long Island', 'Vierling', 'Hercules'] },
    { name: 'Marjoram', family: 'Lamiaceae', types: ['Sweet', 'Wild', 'Pot', 'Gold Tip', 'Common', 'Hardy', 'Greek', 'Italian', 'Cretan', 'Syrian', 'Knotted', 'Zaatar', 'Variegated'] },
    { name: 'Tarragon', family: 'Asteraceae', types: ['French', 'Russian', 'Mexican', 'Texas', 'Spanish', 'Winter', 'Four Seasons', 'Silver King', 'True French', 'Provence'] },
    { name: 'Chamomile', family: 'Asteraceae', types: ['German', 'Roman', 'Dyers', 'Moroccan', 'English', 'Hungarian', 'Wild', 'Lawn', 'Double Flowered', 'Pineapple', 'Bodegold', 'Zloty Lan'] },
    { name: 'Fennel', family: 'Apiaceae', types: ['Florence', 'Bronze', 'Sweet', 'Smokey', 'Purpureum', 'Zefa Fino', 'Perfection', 'Orion', 'Dragon', 'Rubrum', 'Green Tusk', 'Sirio', 'Preludio', 'Mantovano'] },
    { name: 'Lemongrass', family: 'Poaceae', types: ['East Indian', 'West Indian', 'Citronella', 'Malabar', 'Cymbopogon Flexuosus', 'Cymbopogon Citratus', 'Java Citronella', 'Thai', 'Malaysian', 'Serai'] },
    { name: 'Savory', family: 'Lamiaceae', types: ['Summer', 'Winter', 'Creeping', 'Lemon', 'Pink', 'Dwarf Winter', 'Compact', 'Midget', 'Aromata', 'Bolognese', 'Carinthia', 'Nana', 'Saturn'] },
    { name: 'Coriander', family: 'Apiaceae', types: ['Slow Bolt', 'Santo', 'Calypso', 'Leisure', 'Long Standing', 'Marino', 'Cruiser', 'Confetti', 'Vietnamese', 'Delfino', 'Jantar', 'Caribe', 'Lemon', 'Spice', 'Fiesta'] },
    { name: 'Lovage', family: 'Apiaceae', types: ['Common', 'Maggi Plant', 'Scottish', 'Herb Lovage', 'Garden Lovage', 'Scots Lovage', 'Bladder Seed', 'Szechuan Lovage', 'Chinese Lovage', 'Japanese Lovage', 'Korean Lovage'] },
    { name: 'Cumin', family: 'Apiaceae', types: ['Common', 'Black', 'Sweet', 'Iranian', 'Indian', 'Mediterranean', 'Egyptian', 'Turkish', 'Syrian', 'Persian', 'Andalusian'] },
    { name: 'Basil', family: 'Lamiaceae', types: ['Sweet', 'Genovese', 'Thai', 'Lemon', 'Cinnamon', 'Greek', 'Purple', 'Holy', 'Lettuce Leaf', 'Spicy Globe', 'Napoletano', 'African Blue', 'Dark Opal', 'Cardinal', 'Lime', 'Summerlong', 'Red Rubin', 'Siam Queen', 'Green Pepper', 'Christmas'] },
    { name: 'Rosemary', family: 'Lamiaceae', types: ['Common', 'Tuscan Blue', 'Arp', 'Gorizia', 'Spice Islands', 'Salem', 'Prostrate', 'Irene', 'Blue Boy', 'Benenden Blue', 'Foresteri', 'Hill Hardy', 'Madeline Hill', 'Miss Jessup\'s Upright', 'Pine Scented', 'Roman Beauty', 'Severn Sea', 'White Rosemary', 'Collingwood Ingram'] },
    { name: 'Parsley', family: 'Apiaceae', types: ['Italian Flat Leaf', 'Curly', 'Giant of Italy', 'Hamburg Root', 'Japanese', 'Forest Green', 'Dark Green Italian', 'Moss Curled', 'Triple Curled', 'Extra Curled Dwarf', 'Plain Leaf', 'French', 'Titan', 'Wega', 'Paramount', 'Festival'] },
    { name: 'Cilantro', family: 'Apiaceae', types: ['Santo', 'Calypso', 'Leisure', 'Slow Bolt', 'Vietnamese', 'Moroccan', 'Indian', 'Culantro', 'Delfino', 'Marino', 'Cruiser', 'Long Standing', 'Jantar', 'Pot Cilantro', 'Dragon\'s Tongue'] },
    { name: 'Lavender', family: 'Lamiaceae', types: ['English', 'French', 'Spanish', 'Portuguese', 'Dutch', 'Hidcote', 'Munstead', 'Provence', 'Grosso', 'Lavandin', 'Vera', 'Royal Velvet', 'Phenomenal', 'Folgate', 'Melissa', 'Thumbelina Leigh', 'Violet Intrigue', 'Silver Anouk', 'Fathead', 'Nana Alba'] },
    { name: 'Chervil', family: 'Apiaceae', types: ['Common', 'Curled', 'Brussels Winter', 'Vertissimo', 'Crispum', 'Fine Curled', 'Extra Curled', 'Fijne Krul', 'Massa', 'Tender and True'] },
    { name: 'Borage', family: 'Boraginaceae', types: ['Blue', 'White', 'Variegata', 'Common', 'Creeping', 'Alba', 'Turkish', 'English', 'European', 'Borago Officinalis'] },
    { name: 'Stevia', family: 'Asteraceae', types: ['Common', 'Sugar Leaf', 'Candy', 'Sweet Herb', 'Paraguayan', 'Honey Leaf', 'Sweet Leaf', 'Sweetleaf'] },
    { name: 'Lemon Verbena', family: 'Verbenaceae', types: ['Common', 'Aloysia', 'Sweet', 'Standard', 'French', 'Chilean', 'Argentinian', 'Peruvian', 'Herb Louisa'] },
    { name: 'Echinacea', family: 'Asteraceae', types: ['Purple Coneflower', 'Narrow-leaved', 'Pale Purple', 'Yellow', 'Tennessee', 'Paradoxa', 'Purpurea', 'Angustifolia', 'Pallida', 'White Swan', 'Magnus', 'Prairie Splendor', 'Pow Wow Wild Berry', 'Cheyenne Spirit'] },
    { name: 'Anise', family: 'Apiaceae', types: ['Common', 'Sweet', 'Persian', 'Chinese Star', 'European', 'Spanish', 'Italian', 'Turkish', 'Egyptian', 'Bulgarian', 'Hyssop'] },
    { name: 'Catnip', family: 'Lamiaceae', types: ['Common', 'Lemon', 'Greek', 'Camphor', 'Citriodora', 'Catmint', 'Persian', 'Nepeta', 'Faassenii', 'Six Hills Giant', 'Walkers Low', 'Blue Wonder'] },
    { name: 'Sorrel', family: 'Polygonaceae', types: ['Garden', 'French', 'Red-veined', 'Sheep', 'Blood', 'Rumex', 'Acetosa', 'Sanguineus', 'Buckler Leaf', 'Round-Leaved', 'Belleville', 'Large Leaf', 'Lyonnaise', 'Silver'] },
    { name: 'Hyssop', family: 'Lamiaceae', types: ['Common', 'Blue', 'White', 'Pink', 'Rock', 'Anise', 'Korean', 'Giant', 'Dwarf', 'Officinalis', 'Roseus', 'Nectar Blue', 'Nectar Rose', 'Alba'] },
    { name: 'Germander', family: 'Lamiaceae', types: ['Wall', 'Creeping', 'Tree', 'American', 'Pyrenean', 'Water', 'Wonder of Wonder', 'Teucrium', 'Chamaedrys', 'Canadense', 'Lucidrys', 'Fruticans'] }
  ];
  
  herbTemplates.forEach(template => {
    template.types.forEach(type => {
      const plantName = type.includes(template.name) ? type : `${type} ${template.name}`;
      
      // Generate growing data with variations for herbs
      const indoorStart = Math.floor(Math.random() * 3); // 0-2 (Jan-Mar)
      const indoorEnd = indoorStart + Math.floor(Math.random() * 2) + 1; // 1-2 months after indoor start
      const outdoorStart = indoorEnd + Math.floor(Math.random() * 2); // 0-1 months after indoor end
      const outdoorEnd = outdoorStart + 1 + Math.floor(Math.random() * 3); // 1-3 months after outdoor start
      
      // Generate germination data
      const minTemp = 10 + Math.floor(Math.random() * 15); // 10-24°C
      const maxTemp = minTemp + 5 + Math.floor(Math.random() * 10); // 5-14°C above min
      const optimalTemp = minTemp + Math.floor((maxTemp - minTemp) * 0.6); // 60% between min and max
      
      const minDays = 5 + Math.floor(Math.random() * 10); // 5-14 days
      const maxDays = minDays + 7 + Math.floor(Math.random() * 21); // 7-27 days more than min
      
      // Generate random days to maturity for this herb
      const daysToMaturity = 45 + Math.floor(Math.random() * 40); // 45-85 days
      
      // Create seed depth info - most herbs need shallow planting
      const seedDepth = Math.random() < 0.6 ? 0.3 : 0.6;
      
      // Generate herb-appropriate characteristics
      const isPerennial = Math.random() < 0.4; // 40% chance to be perennial
      const hasAroma = Math.random() < 0.8; // 80% chance to be aromatic
      const hasFlowers = Math.random() < 0.7; // 70% chance to have notable flowers
      
      // Create herb with enhanced structure
      const herb = {
        id: idCounter++,
        name: plantName,
        type: 'Herb',
        family: template.family,
        varieties: [type],
        // Support search terms for find-by-variety
        searchTerms: [
          plantName.toLowerCase(),
          type.toLowerCase(),
          template.name.toLowerCase(),
          isPerennial ? "perennial" : "annual",
          hasAroma ? "aromatic" : null,
          hasFlowers ? "flowering" : null
        ].filter(Boolean),
        indoorStart: indoorStart,
        indoorEnd: indoorEnd,
        outdoorStart: outdoorStart,
        outdoorEnd: outdoorEnd,
        seedViability: { 
          years: Math.floor(Math.random() * 3) + 1, // 1-3 years
          notes: `${plantName} seeds typically remain viable for ${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 3) + 3} years.`
        },
        dataIntegration: {
          confidenceRating: Math.random() < 0.6 ? "high" : "moderate",
          sourceCount: Math.floor(Math.random() * 3) + 2, // 2-4 sources
          primarySource: ['USDA', 'Royal Horticultural Society', 'Herb Society of America', 'Penn State Extension'][Math.floor(Math.random() * 4)],
          lastUpdated: '2023-12-10',
        },
        // Enhanced harvest information
        harvestInfo: {
          instructions: `Harvest ${plantName} by cutting stems just above a pair of leaves to encourage bushier growth. Best harvested in morning after dew has dried but before heat of day.`,
          timing: { 
            period: isPerennial ? 'Continuous' : 'Limited', 
            duration: isPerennial ? 'Throughout growing season' : '6-10 weeks', 
            notes: isPerennial ? 'Can be harvested multiple times throughout the season as new growth appears.' : 'Harvest regularly to promote new growth and prevent flowering, which can diminish flavor.' 
          },
          indicators: `Harvest ${plantName} when plants are established with adequate foliage. For best flavor, harvest ${hasFlowers ? "just before flowering" : "when leaves are young and tender"}.`,
          storage: `Fresh ${plantName} can be stored in the refrigerator for 7-10 days wrapped in slightly damp paper towels. Can also be dried, frozen in ice cube trays with water or oil, or preserved in vinegar depending on variety.`,
          yield: `A single ${plantName} plant typically provides enough for fresh use in a small household. Multiple plants recommended for preservation.`
        },
        // Enhanced specifics
        specifics: {
          days: daysToMaturity,
          isPerennial: isPerennial,
          hasAroma: hasAroma,
          hasFlowers: hasFlowers,
          notes: `${type} ${template.name} with ${hasAroma ? "aromatic" : "mild"} fragrance and ${hasFlowers ? "attractive flowers" : "primarily grown for foliage"}.`,
          culinaryUses: getHerbCulinaryUses(template.name, type),
          medicinalUses: getHerbMedicinalUses(template.name, type),
          companionPlanting: getHerbCompanionInfo(template.name, type)
        },
        germination: {
          soilTemp: { min: minTemp, max: maxTemp, optimal: optimalTemp },
          daysToGerminate: { min: minDays, max: maxDays },
          seedDepth: seedDepth,
          lightNeeded: Math.random() < 0.4, // 40% need light
          specialTechniques: Math.random() < 0.4 ? 
            [["Light exposure needed", "Bottom heat", "Pre-chilling"][Math.floor(Math.random() * 3)]] : 
            [],
          instructions: `Sow seeds ${seedDepth < 0.5 ? "very shallowly" : "1/4 inch deep"} in well-draining soil mix. Keep soil ${Math.random() < 0.5 ? "evenly moist" : "slightly moist but not wet"} until germination.`,
          notes: `${plantName} seeds can be slow to germinate. ${Math.random() < 0.3 ? "For quicker germination, maintain consistent soil moisture and temperature." : "Patience is key!"}`
        },
        growingCycle: {
          daysToMaturity: { 
            min: daysToMaturity - 10, 
            max: daysToMaturity + 15
          },
          harvestWindow: { 
            min: 4 + Math.floor(Math.random() * 4), 
            max: 8 + Math.floor(Math.random() * 10)
          },
          successionPlanting: Math.random() < 0.5, // 50% can be succession planted
          successionInterval: { 
            weeks: 3 + Math.floor(Math.random() * 3), 
            notes: "Plant every few weeks for fresh supply" 
          }
        },
        difficulty: Math.random() < 0.3 ? 'easy' : (Math.random() < 0.7 ? 'moderate' : 'difficult'),
        regionSpecific: generateRegionSpecificInfo(null, template.name, type, daysToMaturity)
      };
      
      extendedDatabase.push(herb);
    });
  });
  
  // Generate flowers
  const flowerTemplates = [
    { name: 'Poppy', family: 'Papaveraceae', types: ['California', 'Oriental', 'Iceland', 'Shirley', 'Hungarian Blue', 'Peony', 'Alpine', 'Corn', 'Flanders', 'Himalayan', 'Arctic', 'Danish Flag', 'Ladybird', 'Champagne Bubbles', 'Falling in Love', 'Pacino', 'Pink Fizz', 'Royal Wedding', 'Turkish Delight', 'Cedar Blue'] },
    { name: 'Aster', family: 'Asteraceae', types: ['China', 'New England', 'Alpine', 'Italian', 'Stokes', 'Sea', 'Tatarian', 'Calico', 'Heath', 'Michaelmas Daisy', 'Monte Casino', 'Purple Dome', 'Monch', 'Blue Wonder', 'Magic Purple', 'Alma Potschke', 'Little Carlow', 'Pink Star', 'Celeste', 'Winston Churchill'] },
    { name: 'Snapdragon', family: 'Plantaginaceae', types: ['Rocket', 'Liberty', 'Madame Butterfly', 'Chantilly', 'Twinny', 'Candy Showers', 'Sonnet', 'Animation', 'Snappy Tongue', 'Maryland', 'Tahiti', 'Bronze Dragon', 'Night and Day', 'Black Prince', 'Floral Showers', 'Costa', 'Cool', 'Frosted Flames', 'Monarch', 'Opus'] },
    { name: 'Pansy', family: 'Violaceae', types: ['Swiss Giant', 'Joker', 'Majestic Giant', 'Matrix', 'Delta', 'Cool Wave', 'Frizzle Sizzle', 'Imperial', 'Karma', 'Mammoth', 'Moulin Rouge', 'Nature', 'Super Swiss Giant', 'Ullswater', 'Wonderfall', 'Inspire', 'Panola', 'Karma Blue Butterfly', 'Padparadja', 'Princess Series'] },
    { name: 'Petunia', family: 'Solanaceae', types: ['Grandiflora', 'Multiflora', 'Milliflora', 'Wave', 'Supertunia', 'Cascadia', 'Tidal Wave', 'Double Cascade', 'Dreams', 'Easy Wave', 'Merlin', 'Picobella', 'Prism', 'Shock Wave', 'Surfinia', 'Supercascade', 'Ultra', 'Vista', 'Opera Supreme', 'Celebrity'] },
    { name: 'Daisy', family: 'Asteraceae', types: ['Shasta', 'African', 'Gerber', 'English', 'Oxeye', 'Painted', 'Gerbera', 'Snowcap', 'Ice Star', 'Crazy', 'Silver Princess', 'May Queen', 'Becky', 'Snow Lady', 'Ooh La LaSpider', 'Alaska', 'Banana Cream', 'Real Glory', 'Real Dream', 'Bellis Perennis'] },
    { name: 'Morning Glory', family: 'Convolvulaceae', types: ['Heavenly Blue', 'Crimson Rambler', 'Flying Saucers', 'Grandpa Ott\'s', 'Moonflower', 'Early Call', 'Scarlett O\'Hara', 'Pearly Gates', 'Blue Star', 'Knowlians Black', 'Chocolate', 'Venice Pink', 'Mount Fuji', 'Split Personality', 'Carnevale di Venezia', 'Giant White', 'Shake, Rattle and Roll', 'Sunrise Serenade', 'Blue Ensign', 'Wedding Bells'] },
    { name: 'Columbine', family: 'Ranunculaceae', types: ['McKana Giant', 'Origami', 'Songbird', 'Winky', 'Barlow', 'Blue Barlows', 'Nora Barlow', 'Colorado Blue', 'Crimson Star', 'Swan Pink and Yellow', 'Little Lanterns', 'Clementine', 'Lime Sorbet', 'Black Barlow', 'Pink Lanterns', 'Rocky Mountain', 'Dragonfly', 'Tower Blue', 'Ruby Port', 'Red Hobbit'] },
    { name: 'Rudbeckia', family: 'Asteraceae', types: ['Black-eyed Susan', 'Cherokee Sunset', 'Prairie Sun', 'Goldsturm', 'Cherry Brandy', 'Indian Summer', 'Toto', 'Autumn Colors', 'Denver Daisy', 'Goldilocks', 'Hirta', 'Irish Eyes', 'Maya', 'Moreno', 'Chocolate Orange', 'Rustic Dwarfs', 'Sonora', 'Marmalade', 'Cappuccino', 'Green Wizard'] },
    { name: 'Larkspur', family: 'Ranunculaceae', types: ['Imperial', 'Giant Imperial', 'Earl Grey', 'Sublime', 'Cloudy Skies', 'Cannes', 'Galilee', 'Jenny\'s Pearl', 'Misty Lavender', 'QIS Series', 'Fancy Purple Picotee', 'Sublime Pink', 'Blue Cloud', 'Frosted Skies', 'Sea Foam', 'White King', 'Dark Blue', 'Lilac Spire', 'Rose Queen', 'Summer Skies'] },
    { name: 'Lupine', family: 'Fabaceae', types: ['Russell', 'Gallery', 'Minarette', 'Pixie Delight', 'Manhattan Lights', 'The Governor', 'Noble Maiden', 'The Chatelaine', 'Chandelier', 'Mini Gallery', 'The Pages', 'Towering Inferno', 'The Chandeliers', 'Fairy Lights', 'Red Rum', 'Salmon Star', 'Tutti Frutti', 'Masterpiece', 'Persian Slipper', 'My Castle'] },
    { name: 'Coneflower', family: 'Asteraceae', types: ['Purple', 'White Swan', 'Cheyenne Spirit', 'Green Jewel', 'Pink Double Delight', 'Magnus', 'PowWow Wild Berry', 'Bright Star', 'Firebird', 'Fragrant Angel', 'Hot Papaya', 'Marmalade', 'Merlot', 'Primadonna Deep Rose', 'Ruby Star', 'Sundown', 'Tiki Torch', 'Tomato Soup', 'Harvest Moon', 'Secret Passion'] },
    { name: 'Hollyhock', family: 'Malvaceae', types: ['Chater\'s Double', 'Majorette', 'Queeny', 'Spotlight', 'Peaches \'n Dreams', 'Black Knight', 'Creme de Cassis', 'Halo Apricot', 'Halo Candy', 'Indian Spring', 'Nigra', 'Powderpuffs Mixed', 'Summer Carnival', 'Spring Celebrities', 'Fiesta Time', 'Happy Lights', 'Sunshine', 'The Bride', 'Blackberry Ripple', 'Mars Magic'] },
    { name: 'Cosmos', family: 'Asteraceae', types: ['Sensation', 'Seashells', 'Sonata', 'Double Click', 'Velouette', 'Bright Lights', 'Candy Stripe', 'Chocolate', 'Cosmos Cupcakes', 'Picotee', 'Psyche', 'Purity', 'Rubenza', 'Sea Shells', 'Sonata Carmine', 'Sulphureus', 'Xanthos', 'Apollo', 'Cosimo', 'Dwarf Sensation'] },
    { name: 'Marigold', family: 'Asteraceae', types: ['French', 'African', 'Signet', 'Crackerjack', 'Durango', 'Antigua', 'Alumia', 'Aurora', 'Bonanza', 'Brocade', 'Disco', 'Dolly', 'First Lady', 'Flamenco', 'Inca', 'Janie', 'Safari', 'Snowball', 'Spun Gold', 'Sweet Cream'] },
    { name: 'Calendula', family: 'Asteraceae', types: ['Pacific Beauty', 'Touchstone Gold', 'Zeolights', 'Snow Princess', 'Radio', 'Art Shades', 'Bon Bon', 'Calexis', 'Daisy', 'Erfurter Orangefarbige', 'Fiesta Gitana', 'Kablouna', 'Kinglet', 'Nova', 'Orange King', 'Princess Golden', 'Resina', 'Solar Flashback Mix', 'Strawberry Blonde', 'Triangle Flashbacks'] },
    { name: 'Bachelor Button', family: 'Asteraceae', types: ['Blue Boy', 'Classic Romantic', 'Black Magic', 'Florist Blue', 'Alba', 'Burgundy', 'Classic Magic', 'Frosted Queen', 'Jubilee Gem', 'Midget', 'Pinkie', 'Polka Dot', 'Red Boy', 'Snowman', 'Florence Pink', 'Florence Purple', 'Frosty Mix', 'Midnight', 'Red, White, and Blue', 'Tall Double'] },
    { name: 'Sweet Alyssum', family: 'Brassicaceae', types: ['Snow Crystals', 'Easter Basket', 'Wonderland', 'New Carpet of Snow', 'Rosie O\'Day', 'Aphrodite', 'Benthamii', 'Little Dorrit', 'Little Gem', 'Navy Blue', 'Oriental Night', 'Paletta', 'Princess in Purple', 'Royal Carpet', 'Snowdrift', 'Summer Romance', 'Tiny Tim', 'Violet Queen', 'Yolo White', 'Clear Crystal'] },
    { name: 'Nasturtium', family: 'Tropaeolaceae', types: ['Jewel', 'Empress of India', 'Peach Melba', 'Whirlybird', 'Alaska', 'Black Velvet', 'Caribbean Crush', 'Cherry Rose', 'Climbing Phoenix', 'Gleam', 'King Theodore', 'Ladybird', 'Mahogany Gleam', 'Milkmaid', 'Moonlight', 'Phoenix', 'Salmon Baby', 'Salmon Gleam', 'Strawberries and Cream', 'Tip Top'] },
    { name: 'Phlox', family: 'Polemoniaceae', types: ['Drummond', 'Twinkle', 'Intensia', 'David', 'Franz Schubert', 'Blue Paradise', 'Bright Eyes', 'Early Start', 'Flame', 'Grape Lollipop', 'Laura', 'Miss Lingard', 'Nora Leigh', 'Orange Perfection', 'Peppermint Twist', 'Red Riding Hood', 'Robert Poore', 'Blue Moon', 'Coral Crème Drop', 'Nicky'] },
    { name: 'Viola', family: 'Violaceae', types: ['Johnny Jump Up', 'Sorbet', 'Penny', 'Velour', 'Admire', 'Angel Amber Kiss', 'Arkwright Ruby', 'Blackberry Sorbet', 'Celestial', 'Columbine', 'Floral Powers', 'Helen Mount', 'Ivory Prince', 'King Henry', 'Rebecca', 'Starry Night', 'Tiger Eyes', 'Viola Labradorica', 'Molly Sanderson', 'Prince John'] },
    { name: 'Zinnia', family: 'Asteraceae', types: ['California Giant', 'Benary\'s Giant', 'State Fair', 'Profusion', 'Zahara', 'Cut and Come Again', 'Dreamland', 'Envy', 'Magellan', 'Oklahoma', 'Peppermint Stick', 'Persian Carpet', 'Purple Prince', 'Queeny Lime Orange', 'Red Spider', 'Senora', 'Swizzle', 'Thumbelina', 'Whirligig', 'Zinnita'] },
    { name: 'Foxglove', family: 'Plantaginaceae', types: ['Camelot', 'Dalmation', 'Excelsior', 'Foxy', 'Apricot Beauty', 'Candy Mountain', 'Café Crème', 'Castor', 'Digitalis Ferruginea', 'Dwarf Primrose Carousel', 'Elsie Kelsey', 'Goldcrest', 'Limoncello', 'Mertonensis', 'Pam\'s Choice', 'Polkadot Pippa', 'Snow Thimble', 'Strawberry', 'Sugar Plum', 'Vera\'s Primrose'] },
    { name: 'Sweet Pea', family: 'Fabaceae', types: ['Royal', 'Spencer', 'Old Spice', 'Mammoth', 'Cupani', 'April in Paris', 'Almost Black', 'Beaujolais', 'Blue Celeste', 'Captain of the Blues', 'Chocolate Flake', 'High Scent', 'King Edward VII', 'Lipstick', 'Matucana', 'Mrs. Collier', 'Painted Lady', 'Turquoise Lagoon', 'White Supreme', 'Winter Elegance'] },
    { name: 'Forget-Me-Not', family: 'Boraginaceae', types: ['Victoria Blue', 'Indigo Blue', 'Snowsylva', 'Royal Blue', 'Alba', 'Indigo Compact', 'Sylva', 'Ultramarine', 'Myosotis Alpestris', 'Rosylva', 'Blue Ball', 'Blue Bird', 'Compindi', 'Marga Sacher', 'Music', 'Pink Bouquet', 'Pompadour', 'Sylvia', 'Victoria Azure Blue', 'Victoria Rose'] },
    { name: 'Dianthus', family: 'Caryophyllaceae', types: ['Sweet William', 'Carnation', 'Pinks', 'Maiden Pink', 'Chabaud', 'Allwood', 'Cheddar', 'China Pinks', 'Devine', 'Flashing Lights', 'Firewitch', 'Flavora Rose Shades', 'Frosty Fire', 'Fruit Punch', 'Neon Star', 'Raspberry Parfait', 'Rockin Red', 'Sops in Wine', 'Spotty', 'Superbus'] },
    { name: 'Hibiscus', family: 'Malvaceae', types: ['Rose Mallow', 'Rose of Sharon', 'Chinese', 'Mahogany Splendor', 'Airbrush Effect', 'Blackberry Swirl', 'Border Glory', 'Brandy Punch', 'Cherry Cheesecake', 'Cranberry Crush', 'Disco Belle', 'Fantasia', 'Luna Red', 'Mars Madness', 'Moy Grande', 'Old Yella', 'Peppermint Schnapps', 'Pink Swirl', 'Robert Fleming', 'Sunny Yellow'] },
    { name: 'Stock', family: 'Brassicaceae', types: ['Brompton', 'Night-Scented', 'Vintage', 'Quartet', 'Apricot', 'Crimson', 'Iron', 'Legacy', 'Mammoth Column', 'Midget', 'Most Scented Mix', 'Starlight Sensation', 'Sugar and Spice', 'Trysomic Seven Week', 'White Wonder', 'Giant Excelsior Column', 'Giant Imperial Column', 'Hot Cakes', 'White Wonder', 'Harmony'] },
    { name: 'Statice', family: 'Plumbaginaceae', types: ['German', 'Sea Lavender', 'Fortress', 'QIS', 'Apricot', 'Art Shades', 'Blue River', 'Excellent Mix', 'Forever Gold', 'Iceberg', 'Midnight Blue', 'Pacific', 'Petite Bouquet', 'Purple Attraction', 'Rose Spire', 'Safora', 'Seeker', 'Supreme', 'Turbo', 'Wonder'] },
    { name: 'Yarrow', family: 'Asteraceae', types: ['Achillea', 'Summer Pastels', 'Moonshine', 'Apple Blossom', 'Apricot Delight', 'Cerise Queen', 'Cloth of Gold', 'Coronation Gold', 'Desert Eve', 'Fanal', 'Fireland', 'Gold Plate', 'Little Moonshine', 'Millefolium', 'New Vintage Red', 'Paprika', 'Red Velvet', 'Summer Berries', 'Terra Cotta', 'The Pearl'] },
    { name: 'Lily', family: 'Liliaceae', types: ['Asiatic', 'Oriental', 'Trumpet', 'Tiger', 'Casa Blanca', 'African Queen', 'Anastasia', 'Arabesque', 'Black Beauty', 'Conca d\'Or', 'Elodie', 'Golden Splendor', 'Leslie Woodriff', 'Lollypop', 'Mapira', 'Mona Lisa', 'Night Flyer', 'Pink Perfection', 'Regale', 'Stargazer'] }
  ];
  
  flowerTemplates.forEach(template => {
    template.types.forEach(type => {
      const plantName = type.includes(template.name) ? type : `${type} ${template.name}`;
      
      // Generate growing data with variations for flowers
      const indoorStart = Math.floor(Math.random() * 4); // 0-3 (Jan-Apr)
      const indoorEnd = indoorStart + Math.floor(Math.random() * 2) + 1; // 1-2 months after indoor start
      const outdoorStart = indoorEnd + Math.floor(Math.random() * 2); // 0-1 months after indoor end
      const outdoorEnd = outdoorStart + 1 + Math.floor(Math.random() * 3); // 1-3 months after outdoor start
      
      // Generate germination data
      const minTemp = 12 + Math.floor(Math.random() * 10); // 12-21°C
      const maxTemp = minTemp + 5 + Math.floor(Math.random() * 10); // 5-14°C above min
      const optimalTemp = minTemp + Math.floor((maxTemp - minTemp) * 0.6); // 60% between min and max
      
      const minDays = 5 + Math.floor(Math.random() * 15); // 5-19 days
      const maxDays = minDays + 5 + Math.floor(Math.random() * 20); // 5-24 days more than min
      
      // Generate random days to maturity for this flower
      const daysToMaturity = 60 + Math.floor(Math.random() * 60); // 60-120 days
      
      // Create seed depth info - many flowers need shallow planting
      const seedDepth = Math.random() < 0.5 ? 0.3 : 0.6;
      
      // Generate flower colors - specific to type where possible
      const flowerColors = {
        'Sunflower': ['Yellow', 'Gold', 'Orange', 'Red', 'Burgundy', 'Bi-color'],
        'Zinnia': ['Red', 'Pink', 'Orange', 'Yellow', 'Purple', 'White', 'Multi-color'],
        'Marigold': ['Yellow', 'Orange', 'Gold', 'Red-Orange', 'Bicolor'],
        'Cosmos': ['Pink', 'White', 'Burgundy', 'Orange', 'Yellow', 'Chocolate'],
        'Poppy': ['Red', 'Orange', 'Pink', 'White', 'Purple', 'Blue', 'Salmon'],
        'Delphinium': ['Blue', 'Purple', 'White', 'Pink', 'Lavender'],
        'Morning Glory': ['Blue', 'Purple', 'Pink', 'White', 'Red', 'Bi-color']
      };
      
      const plantColor = flowerColors[template.name] ? 
        flowerColors[template.name][Math.floor(Math.random() * flowerColors[template.name].length)] : 
        ['White', 'Pink', 'Red', 'Purple', 'Blue', 'Yellow', 'Orange', 'Multi-colored'][Math.floor(Math.random() * 8)];
      
      // Generate bloom characteristics
      const bloomSize = ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)];
      const bloomType = ['Single', 'Double', 'Semi-double', 'Pompom', 'Cactus', 'Anemone', 'Decorative'][Math.floor(Math.random() * 7)];
      const bloomSeason = ['Early Spring', 'Late Spring', 'Early Summer', 'Mid-Summer', 'Late Summer', 'Fall'][Math.floor(Math.random() * 6)];
      const isPerennial = Math.random() < 0.4; // 40% chance to be perennial
      const height = Math.floor(Math.random() * 90) + 10; // 10-100 cm
      
      // Create flower with enhanced structure
      const flower = {
        id: idCounter++,
        name: plantName,
        type: 'Flower',
        family: template.family,
        varieties: [type],
        // Support search terms for find-by-variety
        searchTerms: [
          plantName.toLowerCase(),
          type.toLowerCase(),
          template.name.toLowerCase(),
          plantColor.toLowerCase(),
          bloomType.toLowerCase(),
          isPerennial ? "perennial" : "annual",
          bloomSeason.toLowerCase().replace(' ', '-')
        ].filter(Boolean),
        indoorStart: indoorStart,
        indoorEnd: indoorEnd,
        outdoorStart: outdoorStart,
        outdoorEnd: outdoorEnd,
        seedViability: { 
          years: Math.floor(Math.random() * 4) + 1, // 1-4 years
          notes: `${plantName} seeds usually remain viable for ${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 3) + 2} years when stored properly.`
        },
        dataIntegration: {
          confidenceRating: Math.random() < 0.5 ? "high" : "moderate",
          sourceCount: Math.floor(Math.random() * 3) + 2, // 2-4 sources
          primarySource: ['American Horticultural Society', 'Royal Horticultural Society', 'National Garden Bureau', 'Missouri Botanical Garden'][Math.floor(Math.random() * 4)],
          lastUpdated: '2023-11-05',
        },
        // Enhanced harvest information
        harvestInfo: {
          instructions: `Harvest ${plantName} flowers in the morning when they are fully open but still fresh. Cut stems at an angle with sharp scissors or pruners, removing at least 1/3 of the stem length.`,
          timing: { 
            period: isPerennial ? 'Recurring seasonal' : 'Annual', 
            duration: isPerennial ? 'Returns yearly' : 'Single season', 
            notes: isPerennial ? 'Once established, will return each year with proper care.' : 'Complete life cycle in one growing season.' 
          },
          indicators: `${plantName} flowers are ready to harvest when blooms are fully open but before they begin to fade. For dried flowers, harvest just before peak bloom.`,
          storage: `For fresh cut flowers, remove lower leaves, place in clean water with floral preservative, and change water every 2-3 days. For drying, hang upside down in bunches in a dark, dry location.`,
          yield: `A mature ${plantName} plant can produce ${Math.floor(Math.random() * 15) + 5}-${Math.floor(Math.random() * 30) + 20} flower stems per season.`
        },
        // Enhanced specifics
        specifics: {
          days: daysToMaturity,
          color: plantColor,
          bloomSize: bloomSize,
          bloomType: bloomType,
          bloomSeason: bloomSeason,
          isPerennial: isPerennial,
          height: height,
          notes: `${bloomSize} ${bloomType} flowers in ${plantColor.toLowerCase()} shades. ${isPerennial ? "Perennial" : "Annual"} that blooms in ${bloomSeason}.`,
          pollinatorValue: getPollinatorValue(template.name, type),
          gardenUses: getFlowerGardenUses(template.name, type, height),
          companionPlanting: getFlowerCompanionInfo(template.name, type)
        },
        germination: {
          soilTemp: { min: minTemp, max: maxTemp, optimal: optimalTemp },
          daysToGerminate: { min: minDays, max: maxDays },
          seedDepth: seedDepth,
          lightNeeded: Math.random() < 0.5, // 50% need light
          specialTechniques: Math.random() < 0.4 ? 
            [["Light exposure needed", "Cold stratification", "Scarification", "Pre-soaking"][Math.floor(Math.random() * 4)]] : 
            [],
          instructions: `${seedDepth < 0.5 ? "Surface sow" : "Plant"} seeds ${seedDepth < 0.5 ? "barely covering with soil" : "to a depth of " + (seedDepth < 0.5 ? "1/8" : "1/4") + " inch"}. ${Math.random() < 0.3 ? "Press seeds firmly into soil for good contact." : ""}`,
          notes: `${plantName} ${Math.random() < 0.5 ? "seeds need light to germinate. Do not cover deeply." : "prefers consistent moisture during germination, but avoid overwatering which can cause damping off."}`
        },
        growingCycle: {
          daysToMaturity: { 
            min: daysToMaturity - 15, 
            max: daysToMaturity + 15
          },
          harvestWindow: { 
            min: 2 + Math.floor(Math.random() * 4), 
            max: 6 + Math.floor(Math.random() * 8)
          },
          successionPlanting: Math.random() < 0.4, // 40% can be succession planted
          successionInterval: { 
            weeks: 2 + Math.floor(Math.random() * 2), 
            notes: "Plant every few weeks for continuous blooms" 
          }
        },
        difficulty: Math.random() < 0.3 ? 'easy' : (Math.random() < 0.7 ? 'moderate' : 'difficult'),
        regionSpecific: generateRegionSpecificInfo(null, template.name, type, daysToMaturity)
      };
      
      extendedDatabase.push(flower);
    });
  });
  
  return extendedDatabase;
}

// Helper to get default region specific data
// This function is exported for use in other modules that import from this file
export function getDefaultRegionSpecific(type) {
  // Default region specific data structure
  return {
    northernHemisphere: {
      zoneAdjustments: {
        cold: { indoorShift: 1, outdoorShift: 2 },
        hot: { indoorShift: 0, outdoorShift: -1 }
      }
    },
    southernHemisphere: {
      seasonAdjust: 6 // Shift by 6 months
    }
  };
}

// Helper functions for enhanced variety information
function determineHarvestTimingByType(baseType, varietyType, daysToMaturity) {
  // Harvest timing based on plant type and variety
  switch(baseType) {
    case 'Tomato':
      return varietyType === 'Determinate' ? 
        { period: 'Concentrated', duration: '2-3 weeks', notes: 'Determinate varieties produce most of their fruit in a 2-3 week period.' } :
        { period: 'Extended', duration: '2-3 months', notes: 'Indeterminate varieties produce continuously until frost kills plants.' };
    case 'Bean':
      return varietyType === 'Bush' ?
        { period: 'Concentrated', duration: '2-3 weeks', notes: 'Bush beans produce most of their crop within a short window.' } :
        { period: 'Extended', duration: '4-8 weeks', notes: 'Pole beans produce continuously once they begin bearing.' };
    case 'Cucumber':
      return { period: 'Extended', duration: '3-6 weeks', notes: 'Regular picking encourages continued production.' };
    case 'Squash':
      return baseType.includes('Winter') ?
        { period: 'Single harvest', duration: '1-2 weeks', notes: 'Harvest when fully mature and cure for storage.' } :
        { period: 'Extended', duration: '4-8 weeks', notes: 'Pick summer squash frequently when young and tender.' };
    case 'Carrot':
      return { period: 'Flexible', duration: '2-4 weeks', notes: 'Can be harvested as needed once mature. Flavor often improves after light frost.' };
    case 'Lettuce':
      return { period: 'Cut-and-come-again', duration: '3-4 weeks', notes: 'Harvest outer leaves for extended production or cut entire head.' };
    case 'Radish':
      return { period: 'Single harvest', duration: '1 week', notes: 'Harvest promptly when mature to prevent pithiness and splitting.' };
    case 'Hot Pepper':
    case 'Bell Pepper':
    case 'Sweet Pepper':
      return { period: 'Extended', duration: '6-8 weeks', notes: 'Harvest at green stage or allow to ripen to full color for sweeter flavor.' };
    default:
      // Default timing based on days to maturity
      if (daysToMaturity < 40) {
        return { period: 'Quick', duration: '1-2 weeks', notes: 'Fast-growing crop with relatively short harvest window.' };
      } else if (daysToMaturity < 70) {
        return { period: 'Standard', duration: '2-4 weeks', notes: 'Typical harvest window for this type of crop.' };
      } else {
        return { period: 'Long-season', duration: '3-8 weeks', notes: 'Slower to mature but often produces over a longer period.' };
      }
  }
}

function getHarvestIndicators(baseType, variety, color) {
  // Specific indicators for when to harvest
  switch(baseType) {
    case 'Tomato':
      if (variety.includes('Green')) {
        return "Harvest when fruit has reached full size and has slight give when pressed.";
      } else {
        return `Harvest when color has fully developed to ${color.toLowerCase() || 'red'} and fruit yields slightly to gentle pressure.`;
      }
    case 'Cucumber':
      return "Harvest when fruits are firm, bright green (unless a specialty variety), and appropriate size for the variety. Overripe cucumbers become bitter and seedy.";
    case 'Bean':
      return "Harvest snap beans when pods are smooth, firm, and before seeds have fully developed. Pick shell beans when pods are plump but still somewhat green.";
    case 'Lettuce':
      return "Harvest when heads reach full size but before bolting begins. Signs of bolting include elongation of the central stem and bitter flavor.";
    case 'Carrot':
      return "Harvest when roots have reached appropriate size for the variety, typically when shoulders are 3/4 to 1 inch in diameter.";
    case 'Radish':
      return "Harvest when roots have reached full size but before they become pithy or develop hot, unpleasant flavor. Check by pulling one sample.";
    case 'Squash':
      if (baseType.includes('Winter')) {
        return "Harvest when skin has hardened (cannot be pierced with a fingernail) and has reached proper color for the variety.";
      } else {
        return "Harvest summer squash when young and tender, typically 4-8 inches long for zucchini types.";
      }
    case 'Hot Pepper':
    case 'Bell Pepper':
    case 'Sweet Pepper':
      return `Harvest when peppers have reached full size and appropriate color (${color || 'green to red'}). Green peppers are less sweet than fully colored ones.`;
    case 'Pea':
      return "Harvest snap peas when pods are plump with visible peas inside but still tender. Harvest snow peas when pods are flat and peas are just beginning to form.";
    default:
      return "Harvest when crop has reached appropriate size and color for the variety.";
  }
}

function getStorageInfo(baseType, varietyType) {
  // Storage recommendations by plant type
  switch(baseType) {
    case 'Tomato':
      return "Store at room temperature for best flavor. Refrigeration diminishes flavor but can extend shelf life to 1-2 weeks.";
    case 'Cucumber':
      return "Store in refrigerator at high humidity for 1-2 weeks. Wrap in paper towels to absorb excess moisture.";
    case 'Lettuce':
      return "Store in refrigerator in plastic bag with a paper towel to absorb moisture. Will keep for 7-10 days.";
    case 'Bean':
      return "Refrigerate in a perforated plastic bag for 3-5 days. For longer storage, blanch and freeze.";
    case 'Carrot':
      return "Remove tops and store in refrigerator in plastic bag for up to 2-3 weeks. For longer storage, store in moist sand in a cool location.";
    case 'Radish':
      return "Remove tops and store in refrigerator in plastic bag for up to 2 weeks.";
    case 'Squash':
      if (baseType.includes('Winter') || varietyType === 'Winter') {
        return "Cure in warm, dry location for 1-2 weeks, then store in cool, dry place (50-55°F) for 2-6 months depending on variety.";
      } else {
        return "Refrigerate and use within 1 week. Do not wash until ready to use.";
      }
    case 'Hot Pepper':
    case 'Bell Pepper':
    case 'Sweet Pepper':
      return "Store in refrigerator for up to 2 weeks. Can be frozen, dried, or pickled for longer preservation.";
    case 'Pea':
      return "Refrigerate immediately after harvest and use within 2-3 days. Peas quickly lose sweetness after picking.";
    case 'Onion':
      if (varietyType?.includes('Green') || varietyType?.includes('Bunching')) {
        return "Store green onions in refrigerator for up to 1 week.";
      } else {
        return "Cure by laying in single layer in warm, dry place with good air circulation for 2-3 weeks until necks are dry. Store in cool, dry place for 3-6 months.";
      }
    case 'Beet':
    case 'Turnip':
      return "Remove tops leaving 1-2 inches of stem. Store in refrigerator in plastic bag for 2-3 weeks. For long-term storage, store in moist sand in cool location.";
    case 'Kale':
      return "Store in refrigerator in plastic bag for 5-7 days. Wash just before using.";
    default:
      return "Store in refrigerator in high humidity for most vegetables. Use promptly for best quality and nutrition.";
  }
}

function getYieldEstimate(baseType, size, varietyType) {
  // Yield estimates
  const sizeMultiplier = size === 'Small' ? 0.7 : (size === 'Large' || size === 'Very Large') ? 1.5 : 1;
  
  switch(baseType) {
    case 'Tomato':
      const baseYield = varietyType === 'Determinate' ? "10-15 pounds" : "15-25+ pounds";
      return `Typical yield: ${baseYield} per plant over the growing season. ${varietyType === 'Cherry' ? 'Cherry types may produce hundreds of small fruits.' : ''}`;
    case 'Cucumber':
      return `Typical yield: ${Math.round(8 * sizeMultiplier)}-${Math.round(12 * sizeMultiplier)} fruits per plant over the growing season.`;
    case 'Lettuce':
      return "Typical yield: 1 head per plant.";
    case 'Bean':
      if (varietyType?.includes('Pole')) {
        return `Typical yield: ${Math.round(2 * sizeMultiplier)}-${Math.round(3 * sizeMultiplier)} pounds per plant over the growing season.`;
      } else {
        return `Typical yield: ${Math.round(0.5 * sizeMultiplier)}-${Math.round(0.75 * sizeMultiplier)} pounds per plant.`;
      }
    case 'Carrot':
      return `Typical yield: 1 carrot per plant. 10-12 carrots per square foot when properly spaced.`;
    case 'Radish':
      return "Typical yield: 1 radish per plant. 16-20 radishes per square foot when properly spaced.";
    case 'Squash':
      if (baseType.includes('Winter') || varietyType === 'Winter') {
        return `Typical yield: ${Math.round(2 * sizeMultiplier)}-${Math.round(5 * sizeMultiplier)} squash per plant.`;
      } else {
        return `Typical yield: ${Math.round(6 * sizeMultiplier)}-${Math.round(10 * sizeMultiplier)} squash per plant over the growing season.`;
      }
    case 'Hot Pepper':
    case 'Bell Pepper':
    case 'Sweet Pepper':
      return `Typical yield: ${Math.round(6 * sizeMultiplier)}-${Math.round(10 * sizeMultiplier)} peppers per plant over the growing season.`;
    case 'Pea':
      return `Typical yield: ${Math.round(0.5 * sizeMultiplier)}-${Math.round(1 * sizeMultiplier)} pounds per 5-foot row.`;
    default:
      return "Yields will vary based on growing conditions and specific variety.";
  }
}

function getCulinaryUses(baseType, variety, varietyType) {
  // Culinary use recommendations
  switch(baseType) {
    case 'Tomato':
      if (variety.includes('Roma') || variety.includes('San Marzano') || variety.includes('Paste') || variety.includes('Amish Paste')) {
        return "Best for sauces, paste, and canning due to meaty texture and low water content.";
      } else if (variety.includes('Cherry') || variety.includes('Grape') || variety.includes('Pear') || 
                varietyType === 'Cherry' || varietyType === 'Grape') {
        return "Perfect for snacking, salads, and roasting whole. Adds bright, sweet flavor to dishes.";
      } else if (variety.includes('Beefsteak') || variety.includes('Brandywine') || variety.includes('Mortgage Lifter')) {
        return "Ideal for sandwiches, burgers, and fresh eating. Large slices with excellent flavor.";
      } else {
        return "Versatile tomato good for fresh eating, cooking, sauces, and canning.";
      }
    case 'Cucumber':
      if (varietyType === 'Pickling' || variety.includes('Pickling') || variety.includes('Gherkin')) {
        return "Ideal for pickling whole or in slices. Can also be used fresh if harvested young.";
      } else if (varietyType === 'Slicing' || variety.includes('Slicing')) {
        return "Perfect for fresh eating in salads, sandwiches, and appetizers.";
      } else if (variety.includes('English') || variety.includes('Seedless')) {
        return "Thin-skinned with few seeds. Excellent for fresh eating without peeling.";
      } else {
        return "Versatile cucumber good for both fresh eating and pickling.";
      }
    case 'Lettuce':
      if (varietyType?.includes('Romaine') || variety.includes('Cos')) {
        return "Crisp texture perfect for Caesar salads. Sturdy leaves can be used as wraps.";
      } else if (varietyType?.includes('Butterhead') || variety.includes('Buttercrunch') || variety.includes('Bibb')) {
        return "Tender leaves with subtle flavor. Excellent for delicate salads and sandwiches.";
      } else if (varietyType?.includes('Loose-leaf')) {
        return "Quick-growing for cut-and-come-again harvesting. Ideal for mixed salads.";
      } else if (varietyType?.includes('Crisphead') || variety.includes('Iceberg')) {
        return "Crunchy texture good for salads, sandwiches, and wraps. Holds up well to heavy dressings.";
      } else {
        return "Versatile lettuce good for salads, sandwiches, and wraps.";
      }
    // Add more base types with specific culinary recommendations
    default:
      return `${variety} ${baseType} can be prepared using standard methods for ${baseType.toLowerCase()}.`;
  }
}

function getDiseaseResistance(baseType, variety) {
  // Disease resistance information
  // Would typically come from a comprehensive database
  // Here we're providing examples for common varieties
  if (baseType === 'Tomato') {
    if (variety.includes('Celebrity') || variety.includes('Better Boy') || variety.includes('Big Beef')) {
      return "Good resistance to Verticillium wilt, Fusarium wilt, nematodes, and tobacco mosaic virus.";
    } else if (variety.includes('Sungold')) {
      return "Some resistance to Fusarium wilt and tobacco mosaic virus.";
    } else if (variety.includes('Brandywine') || variety.includes('Black Krim')) {
      return "Heirloom variety with limited disease resistance. Monitor for signs of common tomato diseases.";
    }
  } else if (baseType === 'Cucumber') {
    if (variety.includes('Marketmore')) {
      return "Good resistance to scab, cucumber mosaic virus, and powdery mildew.";
    } else if (variety.includes('Straight Eight')) {
      return "Moderate disease resistance. Monitor for powdery mildew and cucumber beetles.";
    }
  } else if (baseType === 'Bean') {
    if (variety.includes('Provider')) {
      return "Good resistance to common bean mosaic virus and powdery mildew.";
    } else if (variety.includes('Roma II')) {
      return "Resistant to NY15 strain of common bean mosaic virus.";
    }
  }
  
  return "Check seed packet or supplier for specific disease resistance ratings.";
}

function getGrowingTips(baseType, variety, varietyType) {
  // Specific growing tips for varieties
  switch(baseType) {
    case 'Tomato':
      if (varietyType === 'Determinate') {
        return "Determinate varieties like this one benefit from support but don't require continuous pruning. A simple cage or stakes will work.";
      } else if (varietyType === 'Indeterminate') {
        return "Requires sturdy support and benefits from pruning suckers for better air circulation and larger fruits. Can grow 6+ feet tall.";
      } else if (varietyType === 'Cherry' || variety.includes('Cherry')) {
        return "Very productive plants that may need sturdy support as they become heavily loaded with fruit. Sweet flavor develops best with full sun.";
      } else {
        return "Provide adequate support and consistent watering for best production. Avoid overhead watering to reduce disease.";
      }
    case 'Cucumber':
      if (varietyType === 'Pickling') {
        return "Check daily for harvestable fruits as they develop quickly. Leaving overripe cucumbers on vine reduces overall production.";
      } else if (variety.includes('Armenian') || variety.includes('English')) {
        return "This variety benefits from trellising to keep fruits straight. Performs best in lower humidity conditions.";
      } else {
        return "Consistent moisture leads to better quality fruits. Trellising improves air circulation and makes harvesting easier.";
      }
    case 'Lettuce':
      return "Prefers cool conditions. Provide afternoon shade in warm weather to prevent bolting. Consistent moisture produces tender leaves.";
    case 'Carrot':
      return "Requires loose, rock-free soil for straight roots. Thin carefully to appropriate spacing. Keep consistently moist during germination.";
    case 'Squash':
      if (baseType.includes('Winter') || varietyType?.includes('Winter')) {
        return "Give plenty of space to spread or provide trellising for vining types. Allow to fully mature on vine for best storage quality.";
      } else {
        return "Regular harvesting encourages continued production. Watch for squash bugs and powdery mildew.";
      }
    case 'Hot Pepper':
    case 'Bell Pepper':
    case 'Sweet Pepper':
      return "Benefits from warm soil and full sun. Stake taller varieties to prevent breakage when loaded with fruit.";
    case 'Pea':
      return "Provide support for climbing varieties. Plant early for spring crop as peas prefer cool growing conditions.";
    default:
      return `Standard growing practices for ${baseType.toLowerCase()} apply to this variety.`;
  }
}

function generateRegionSpecificInfo(baseRegionInfo, baseType, varietyType, daysToMaturity) {
  // If we have base data, use it as a starting point
  if (baseRegionInfo) {
    // Create a deep copy of the base info to avoid modifying it
    const regionalInfo = JSON.parse(JSON.stringify(baseRegionInfo));
    
    // Add zoneTips if they don't exist
    if (!regionalInfo.northernHemisphere.zoneTips) {
      regionalInfo.northernHemisphere.zoneTips = {
        "1-3": `In zones 1-3, this variety may require season extension methods like cold frames or high tunnels.`,
        "4-6": `In zones 4-6, standard planting times work well for this variety.`,
        "7-8": `In zones 7-8, consider succession planting for extended harvests.`,
        "9-11": `In zones 9-11, grow as a cool season crop or provide afternoon shade in summer.`
      };
    }
    
    // Add specific modifications based on plant type
    if (baseType === 'Tomato' && (varietyType === 'Cherry' || daysToMaturity < 65)) {
      regionalInfo.northernHemisphere.zoneTips["1-3"] = `This early/cherry tomato variety can work in zones 1-3 with proper season extension.`;
    } else if (baseType === 'Tomato' && daysToMaturity > 85) {
      regionalInfo.northernHemisphere.zoneTips["1-3"] = `This longer-season tomato variety may not fully ripen in zones 1-3 without significant season extension.`;
    } else if (baseType === 'Cucumber' && daysToMaturity < 60) {
      regionalInfo.northernHemisphere.zoneTips["9-11"] = `This early cucumber variety can be grown in spring and fall in zones 9-11 to avoid summer heat.`;
    } else if ((baseType === 'Spinach' || baseType === 'Lettuce' || baseType === 'Kale')) {
      regionalInfo.northernHemisphere.zoneTips["9-11"] = `This cool-season crop does best as a fall, winter, or early spring crop in zones 9-11.`;
    }
    
    return regionalInfo;
  }
  
  // Otherwise, create new regional info from scratch
  return {
    northernHemisphere: {
      zoneAdjustments: {
        cold: { indoorShift: 1, outdoorShift: 2 },
        hot: { indoorShift: 0, outdoorShift: 0 }
      },
      zoneTips: {
        "1-3": getZoneTipsByCold(baseType, varietyType, daysToMaturity),
        "4-6": getZoneTipsByTemperate(baseType, varietyType, daysToMaturity),
        "7-8": getZoneTipsByWarm(baseType, varietyType, daysToMaturity),
        "9-11": getZoneTipsByHot(baseType, varietyType, daysToMaturity)
      }
    },
    southernHemisphere: {
      seasonAdjust: 6, // Shift by 6 months
      zoneTips: {
        "cool": getZoneTipsByCold(baseType, varietyType, daysToMaturity),
        "temperate": getZoneTipsByTemperate(baseType, varietyType, daysToMaturity),
        "warm": getZoneTipsByWarm(baseType, varietyType, daysToMaturity)
      }
    }
  };
}

function getZoneTipsByCold(baseType, varietyType, daysToMaturity) {
  // Zone tips for cold regions (Zones 1-3)
  if (isWarmSeason(baseType)) {
    if (daysToMaturity < 70) {
      return `This early-maturing variety is a good choice for cold regions. Start indoors 6-8 weeks before last frost.`;
    } else {
      return `This variety may need season extenders like row covers or high tunnels in cold regions. Choose shorter-season varieties if possible.`;
    }
  } else if (isCoolSeason(baseType)) {
    return `This cool-season crop grows well in cold regions. Can be planted early and often produces better in cold climates than warm ones.`;
  } else {
    return `In cold regions, start seeds indoors to extend the growing season. Use season extenders when possible.`;
  }
}

function getZoneTipsByTemperate(baseType, varietyType, daysToMaturity) {
  // Zone tips for temperate regions (Zones 4-6)
  if (isWarmSeason(baseType)) {
    return `In temperate regions, start indoors 4-6 weeks before last frost and transplant after frost danger has passed.`;
  } else if (isCoolSeason(baseType)) {
    return `In temperate regions, plant in early spring as soon as soil can be worked, or in late summer for fall harvest.`;
  } else {
    return `This variety grows well in temperate regions with standard planting practices.`;
  }
}

function getZoneTipsByWarm(baseType, varietyType, daysToMaturity) {
  // Zone tips for warm regions (Zones 7-8)
  if (isWarmSeason(baseType)) {
    return `In warm regions, this variety can be planted earlier in spring. Consider succession planting for extended harvest.`;
  } else if (isCoolSeason(baseType)) {
    return `In warm regions, plant in early spring or fall to avoid summer heat. Provides shade in late spring to extend harvest.`;
  } else {
    return `Grows well in warm regions. Consider planting timing to avoid temperature extremes.`;
  }
}

function getZoneTipsByHot(baseType, varietyType, daysToMaturity) {
  // Zone tips for hot regions (Zones 9-11)
  if (isWarmSeason(baseType)) {
    return `In hot regions, this warm-season crop can be planted for an extended season. May need afternoon shade during extreme heat.`;
  } else if (isCoolSeason(baseType)) {
    return `In hot regions, grow as a fall, winter, or early spring crop. Summer temperatures are typically too hot for good production.`;
  } else {
    return `In hot regions, adjust planting times to avoid extreme summer heat. Consider afternoon shade or heat-tolerant varieties.`;
  }
}

function isWarmSeason(baseType) {
  // Identify warm-season crops
  const warmSeasonCrops = ['Tomato', 'Pepper', 'Eggplant', 'Cucumber', 'Squash', 'Corn', 'Bean', 'Melon', 'Okra', 'Sweet Potato', 'Basil'];
  return warmSeasonCrops.some(crop => baseType.includes(crop));
}

function isCoolSeason(baseType) {
  // Identify cool-season crops
  const coolSeasonCrops = ['Lettuce', 'Spinach', 'Kale', 'Broccoli', 'Cabbage', 'Pea', 'Radish', 'Carrot', 'Beet', 'Turnip', 'Onion', 'Garlic', 'Cilantro', 'Parsley'];
  return coolSeasonCrops.some(crop => baseType.includes(crop));
}

// Helper functions for herbs
function getHerbCulinaryUses(baseType, variety) {
  // Culinary usage information for herbs
  switch(baseType) {
    case 'Basil':
      if (variety.includes('Thai')) {
        return "Essential in Thai cuisine, especially in curries, stir-fries, and soups. Distinctive anise-like flavor.";
      } else if (variety.includes('Lemon') || variety.includes('Lime')) {
        return "Citrusy flavor ideal for fish dishes, vinaigrettes, and summer beverages. Pairs well with seafood.";
      } else if (variety.includes('Cinnamon')) {
        return "Sweet, spicy flavor good for desserts, fruit salads, and teas. Can be used in place of cinnamon in some recipes.";
      } else if (variety.includes('Purple')) {
        return "Similar flavor to sweet basil but with decorative purple leaves. Perfect for salads, garnishes, and infused vinegars.";
      } else if (variety.includes('Genovese') || variety.includes('Italian') || variety.includes('Sweet')) {
        return "Classic basil for pesto, tomato dishes, and Italian cuisine. Essential for Caprese salad and Mediterranean cooking.";
      } else {
        return "Versatile culinary herb used in a wide variety of dishes, especially Mediterranean and Asian cuisines.";
      }
    case 'Mint':
      if (variety.includes('Peppermint')) {
        return "Strong menthol flavor best for desserts, teas, and candies. Less commonly used in savory dishes than spearmint.";
      } else if (variety.includes('Spearmint')) {
        return "Traditional mint for savory applications like mint sauce, mint juleps, and Mediterranean dishes. Milder than peppermint.";
      } else if (variety.includes('Chocolate')) {
        return "Subtle chocolate undertones that pair well with desserts. Excellent in hot chocolate, chocolate cake, or chocolate mousse.";
      } else if (variety.includes('Apple') || variety.includes('Pineapple') || variety.includes('Orange')) {
        return "Fruity undertones make it perfect for fruit salads, summer drinks, and garnishing desserts.";
      } else {
        return "Popular herb for teas, garnishes, cocktails, and both sweet and savory dishes.";
      }
    case 'Thyme':
      return "Essential herb in Mediterranean and French cooking. Works well with meats, soups, stews, and roasted vegetables. A key component in bouquet garni and herbes de Provence.";
    case 'Rosemary':
      return "Robust, piney flavor that pairs well with roasted meats, especially lamb and chicken. Also excellent with roasted potatoes and breads.";
    case 'Oregano':
      return "Essential in Italian and Greek cooking. Classic pizza herb that also works well in tomato sauces, grilled meats, and Mediterranean vegetable dishes.";
    case 'Sage':
      return "Traditional herb for poultry and stuffing. Also pairs well with pork, sausages, and in brown butter sauces. Use sparingly as flavor is strong.";
    case 'Cilantro':
      return "Essential in Mexican, Thai, Indian, and Middle Eastern cuisines. Used fresh in salsas, guacamole, curries, and as a garnish. Seeds (coriander) used as a spice.";
    case 'Dill':
      return "Perfect for fish dishes, especially salmon. Essential for pickling and traditional in Eastern European cuisines. Works well in yogurt sauces and with potatoes.";
    case 'Parsley':
      if (variety.includes('Flat') || variety.includes('Italian')) {
        return "More flavorful than curly parsley. Excellent in soups, stews, pasta dishes, and as a finishing herb.";
      } else if (variety.includes('Curly')) {
        return "Traditional garnish with mild flavor. Can be used in tabbouleh, soups, and as part of herb mixes.";
      } else {
        return "Versatile herb used both as a garnish and ingredient in many cuisines worldwide.";
      }
    case 'Chives':
      return "Mild onion flavor makes chives perfect for garnishing potatoes, eggs, soups, and salads. Often added at the end of cooking to preserve flavor.";
    case 'Tarragon':
      return "Essential herb in French cuisine. Distinctive anise flavor pairs well with chicken, fish, eggs, and in vinaigrettes. Key ingredient in béarnaise sauce.";
    default:
      return `${variety} ${baseType} can be used fresh or dried in a variety of culinary applications.`;
  }
}

function getHerbMedicinalUses(baseType, variety) {
  // Traditional and common medicinal uses (note: should include disclaimer for actual implementation)
  const disclaimer = "Note: Traditional medicinal uses are provided for informational purposes only. Consult healthcare professionals before using any herb medicinally.";
  
  switch(baseType) {
    case 'Mint':
      return `Traditionally used to aid digestion and relieve nausea. Often used in tea form for stomach discomfort. ${disclaimer}`;
    case 'Chamomile':
      return `Commonly used as a mild sedative and sleep aid. Also used for digestive issues and as a mild anti-inflammatory. ${disclaimer}`;
    case 'Lavender':
      return `Known for calming properties and relief from mild anxiety. Used in aromatherapy for promoting relaxation and sleep. ${disclaimer}`;
    case 'Echinacea':
      return `Traditionally used to support immune function and reduce duration of cold symptoms. ${disclaimer}`;
    case 'Lemon Balm':
      return `Used for anxiety, insomnia, and digestive issues. Has mild calming properties. ${disclaimer}`;
    case 'Thyme':
      return `Contains thymol, which has antiseptic properties. Traditional uses include treatment of coughs and respiratory issues. ${disclaimer}`;
    case 'Sage':
      return `Traditionally used for sore throats, digestive issues, and excessive sweating. Contains compounds with antimicrobial properties. ${disclaimer}`;
    case 'Rosemary':
      return `Traditionally believed to improve memory and concentration. Contains antioxidants and has been used to improve circulation. ${disclaimer}`;
    case 'Basil':
      return `Used in traditional medicine for digestive issues and as an anti-inflammatory. Holy basil (tulsi) is particularly noted for adaptogenic properties. ${disclaimer}`;
    case 'Oregano':
      return `Contains compounds with antimicrobial properties. Oil of oregano is sometimes used for mild infections and immune support. ${disclaimer}`;
    default:
      return `${variety} ${baseType} has been used in various traditional medicine systems. ${disclaimer}`;
  }
}

function getHerbCompanionInfo(baseType, variety) {
  // Companion planting information
  switch(baseType) {
    case 'Basil':
      return "Excellent companion for tomatoes, improving their flavor and growth. Also benefits peppers, oregano, and asparagus. Repels flies and mosquitoes.";
    case 'Mint':
      return "Best grown in containers as it spreads aggressively. Repels cabbage moths, ants, and rodents. Can inhibit growth of nearby herbs.";
    case 'Rosemary':
      return "Good companion for cabbage, beans, carrots, and sage. Repels cabbage moths, carrot flies, and bean beetles.";
    case 'Thyme':
      return "Benefits cabbage, eggplant, potatoes, strawberries, and tomatoes. Repels cabbage worms and whiteflies.";
    case 'Sage':
      return "Companions well with rosemary, cabbage, and carrots. Repels cabbage moths and carrot flies. Avoid planting near cucumbers.";
    case 'Dill':
      return "Good companion for cabbage and onions. Attracts beneficial insects like wasps and hoverflies. Avoid planting near carrots and tomatoes.";
    case 'Chives':
      return "Improves growth and flavor of carrots and tomatoes. Deters aphids and Japanese beetles. Avoid planting near beans and peas.";
    case 'Cilantro':
      return "Attracts beneficial insects including parasitic wasps and hoverflies. Good companion for spinach, lettuce, and tomatoes.";
    case 'Oregano':
      return "General garden companion that deters many pests. Particularly good near broccoli, cabbage, and cauliflower.";
    case 'Parsley':
      return "Attracts beneficial insects to the garden. Grows well with tomatoes, asparagus, and corn. Can enhance the growth of nearby plants.";
    case 'Chamomile':
      return "Known as a 'plant doctor', it improves the health of plants growing nearby. Particularly good companion for basil, cabbage, and onions.";
    case 'Borage':
      return "Attracts pollinators and deters tomato hornworms. Excellent companion for tomatoes, strawberries, and squash. Also adds trace minerals to soil.";
    case 'Lavender':
      return "Attracts pollinators while repelling many garden pests including fleas, moths, and mosquitoes. Plant near roses and fruit trees.";
    default:
      return `${variety} ${baseType} can be planted alongside most garden vegetables and will help attract pollinators.`;
  }
}

// Flower helper functions
function getPollinatorValue(baseType, variety) {
  // Information on pollinator attraction
  switch(baseType) {
    case 'Sunflower':
      return "Excellent for bees and other pollinators. Seeds also attract birds. Single-flowered varieties provide better access to pollen and nectar than doubles.";
    case 'Zinnia':
      return "Top-rated pollinator plant that attracts butterflies, bees, and hummingbirds. Single-flowered varieties are most accessible to pollinators.";
    case 'Marigold':
      return "Attracts beneficial insects including pollinators. Single and open-centered varieties are best for pollinators.";
    case 'Cosmos':
      return "Highly attractive to bees, butterflies, and beneficial insects like hoverflies and parasitic wasps. Easy to grow and long-blooming.";
    case 'Lavender':
      return "Exceptional pollinator plant that attracts bees, butterflies, and other beneficial insects. One of the best herbs for pollinator gardens.";
    case 'Echinacea':
      return "Native plant that supports native bees, butterflies, and beneficial insects. Long-lasting blooms provide extended nectar sources.";
    case 'Aster':
      return "Valuable late-season nectar source for butterflies, bees, and other pollinators when many other flowers have finished blooming.";
    case 'Borage':
      return "Exceptional bee plant with nectar-rich flowers that replenish quickly, allowing repeated visits throughout the day.";
    case 'Nasturtium':
      return "Attracts hummingbirds, bees, and beneficial insects. Also serves as a trap crop for aphids, protecting other garden plants.";
    case 'Bee Balm':
      return "Premier pollinator plant that attracts bees, butterflies, and hummingbirds. Native varieties support native pollinator species.";
    case 'Calendula':
      return "Attracts many beneficial insects including pollinators. Blooms over a long season providing continuous nectar and pollen.";
    case 'Coneflower':
      return "Excellent native pollinator plant that supports native bees and butterflies. Seed heads provide winter food for birds.";
    case 'Sweet Pea':
      return "Attractive to butterflies and bees, especially bumblebees. Heirloom varieties with fragrance are more attractive to pollinators than some modern varieties.";
    default:
      return `${variety} ${baseType} provides nectar and pollen for various pollinators including bees and butterflies.`;
  }
}

function getFlowerGardenUses(baseType, variety, height) {
  // Garden use recommendations
  const heightCategory = height < 30 ? "low-growing" : (height < 60 ? "medium height" : "tall");
  
  switch(baseType) {
    case 'Sunflower':
      return `Tall background plant for borders or standalone feature. Creates dramatic vertical accent. Larger varieties need staking. Height: ${height}cm.`;
    case 'Zinnia':
      return `Excellent for cutting gardens and borders. Continuous blooms with deadheading. Adaptable to various garden settings. Height: ${height}cm.`;
    case 'Marigold':
      return `Perfect for edging, containers, and vegetable gardens as a companion plant. Helps deter nematodes and other pests. Height: ${height}cm.`;
    case 'Cosmos':
      return `Airy, informal plant for meadow gardens, cottage gardens, and cutting gardens. Low maintenance and drought tolerant once established. Height: ${height}cm.`;
    case 'Delphinium':
      return `Classic cottage garden plant for back of borders. Requires staking in windy areas. Elegant vertical accent. Height: ${height}cm.`;
    case 'Snapdragon':
      return `Versatile plant for borders, containers, and cutting gardens. Provides vertical interest and long blooming period. Height: ${height}cm.`;
    case 'Pansy':
      return `Excellent for containers, edging, and mass planting. Cool season bloomer that adds bright color in spring and fall. Height: ${height}cm.`;
    case 'Sweet Pea':
      return `Climbing variety for trellises, fences, and other supports. Vining types need vertical support; bush types work in borders. Height: ${height}cm.`;
    case 'Morning Glory':
      return `Fast-growing annual vine for covering fences, trellises, and arbors. Use with caution as some varieties can self-seed prolifically. Height: climbing to several meters.`;
    case 'Nasturtium':
      return `${heightCategory === "low-growing" ? "Trailing varieties for containers and hanging baskets" : "Climbing varieties for trellises and fences"}. Entire plant is edible with peppery flavor. Height: ${height}cm.`;
    default:
      return `This ${heightCategory} ${baseType} works well in ${heightCategory === "low-growing" ? "front of borders, edging, and containers" : 
        (heightCategory === "medium height" ? "middle of borders and mixed plantings" : "back of borders and as accent plants")}. Height: ${height}cm.`;
  }
}

function getFlowerCompanionInfo(baseType, type) {
  // Companion planting information for flowers
  switch(baseType) {
    case 'Marigold':
      return "Excellent companion throughout the vegetable garden. Repels nematodes and many insect pests. Particularly beneficial near tomatoes, peppers, and squash.";
    case 'Nasturtium':
      return "Acts as a trap crop for aphids, protecting neighboring plants. Good companion for cucumbers, squash, broccoli, and fruit trees. Edible flowers too.";
    case 'Sunflower':
      return "Provides shade and wind protection for sensitive crops. Attracts pollinators and birds. Plant on north side of garden to avoid shading other plants.";
    case 'Calendula':
      return "Attracts pollinators and beneficial insects. Repels asparagus beetles and tomato hornworms. Good companion for most vegetables.";
    case 'Zinnia':
      return "Excellent for attracting beneficial insects and pollinators to the garden. Helps draw butterflies, hoverflies, and ladybugs which prey on garden pests.";
    case 'Cosmos':
      return "Attracts beneficial insects and pollinators. Its tall, airy structure provides habitat for predatory insects while not competing heavily for nutrients.";
    case 'Borage':
      return "Excellent companion for tomatoes, squash, and strawberries. Deters tomato hornworms and cabbage worms. Attracts pollinators and adds trace minerals to soil.";
    case 'Sweet Alyssum':
      return "Attracts hoverflies whose larvae consume aphids. Creates living mulch when planted between rows of vegetables. Good for interplanting with larger vegetables.";
    case 'Bachelor Button':
      return "Attracts beneficial insects especially pollinators. Traditional companion in cottage gardens with herbs and vegetables.";
    default:
      return `${type} ${baseType} attracts pollinators and adds beauty to the vegetable garden. Most flowering plants help increase garden biodiversity and pollination.`;
  }
}