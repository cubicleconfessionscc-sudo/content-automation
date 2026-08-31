/**
 * Generates 400 unique baby rhyme topics.
 * Animals first (150-200 distinct animals), then educational categories.
 */

const ANIMALS = {
  farm: [
    "cow", "pig", "hen", "rooster", "duck", "goose", "horse", "sheep", "goat",
    "donkey", "turkey", "rabbit", "cat", "dog", "mouse", "rat", "calf", "lamb",
    "bull", "ox", "mule", "pony", "chicken", "chick", "pigeon", "crow",
  ],
  pets: [
    "dog", "cat", "rabbit", "hamster", "goldfish", "parakeet", "turtle",
    "guinea pig", "gerbil", "canary", "puppy", "kitten", "ferret", "chinchilla",
    "cockatiel", "lovebird", "hermit crab", "budgie",
  ],
  wild: [
    "lion", "tiger", "elephant", "giraffe", "monkey", "zebra", "bear",
    "wolf", "fox", "deer", "moose", "elk", "bison", "rhino", "hippo",
    "gorilla", "chimpanzee", "orangutan", "panda", "koala", "kangaroo",
    "camel", "llama", "alpaca", "antelope", "gazelle", "leopard", "cheetah",
    "hyena", "jackal", "meerkat", "raccoon", "squirrel", "hedgehog", "badger",
    "porcupine", "skunk", "otter", "beaver", "muskrat", "possum", "armadillo",
    "sloth", "tapir", "wild boar", "warthog", "mongoose", "cobra", "python",
  ],
  sea: [
    "whale", "shark", "dolphin", "octopus", "crab", "lobster", "seahorse",
    "jellyfish", "starfish", "clam", "oyster", "mussel", "squid", "seal",
    "sea lion", "manatee", "turtle", "ray", "barracuda", "swordfish",
    "pufferfish", "angelfish", "coral", "barnacle", "hermit crab", "urchin",
  ],
  birds: [
    "owl", "parrot", "penguin", "eagle", "hawk", "falcon", "sparrow",
    "robin", "blue jay", "cardinal", "hummingbird", "pelican", "flamingo",
    "swan", "goose", "crane", "stork", "woodpecker", "kingfisher", "kiwi",
    "toucan", "crow", "raven", "magpie", "nightingale", "lark",
  ],
  insects: [
    "bee", "butterfly", "ant", "ladybug", "dragonfly", "grasshopper",
    "cricket", "caterpillar", "beetle", "firefly", "moth", "wasp", "mosquito",
    "cockroach", "termite", "mantis", "flea", "tick", "spider", "scorpion",
    "centipede", "millipede", "snail", "slug", "worm", "pill bug",
  ],
  reptiles: [
    "turtle", "frog", "toad", "snake", "lizard", "gecko", "iguana",
    "chameleon", "crocodile", "alligator", "tortoise", "salamander",
    "newt", "Komodo dragon", "monitor lizard", "cobra", "rattlesnake",
  ],
};

const CATEGORIES = {
  counting: [
    "counting 1 to 10", "counting 1 to 20", "counting by 2s", "counting by 5s",
    "counting by 10s", "counting backwards from 10", "counting fingers and toes",
    "how many wheels", "counting stars in the sky", "counting fish in the sea",
    "counting apples on the tree", "counting bubbles", "counting birds on a wire",
    "counting clouds", "counting flowers in the garden",
  ],
  colors: [
    "the color red", "the color blue", "the color green", "the color yellow",
    "the color orange", "the color purple", "the color pink", "the color brown",
    "the color black", "the color white", "the color rainbow", "mixing colors",
    "primary colors", "warm and cool colors", "my favorite color",
  ],
  shapes: [
    "circles everywhere", "squares all around", "triangles in the sky",
    "rectangles and doors", "stars twinkling bright", "hearts are for love",
    "diamonds in the ring", "ovals like an egg", "pentagon and hexagon",
    "shapes in the house", "shapes at the park", "shapes in outer space",
    "building with shapes", "shapes in the ocean", "shapes on the road",
  ],
  alphabet: [
    "letter A", "letter B", "letter C", "letter D", "letter E", "letter F",
    "letter G", "letter H", "letter I", "letter J", "letter K", "letter L",
    "letter M", "letter N", "letter O", "letter P", "letter Q", "letter R",
    "letter S", "letter T", "letter U", "letter V", "letter W", "letter X",
    "letter Y", "letter Z", "the whole alphabet", "vowels song",
    "consonant sounds", "learning to write letters",
  ],
  time: [
    "days of the week", "months of the year", "telling time with clocks",
    "morning routine", "afternoon fun", "bedtime routine", "seasons changing",
    "what comes after Monday", "yesterday today tomorrow", "how weeks work",
  ],
  body: [
    "head shoulders knees and toes", "my two eyes", "my little nose",
    "ten tiny fingers", "my bouncing legs", "clap your hands",
    "stomp your feet", "wave hello goodbye", "my happy mouth",
    "ears that listen", "hair on my head", "my tummy rumbles",
  ],
  weather: [
    "sunny day", "rainy day", "snowy day", "windy day", "cloudy day",
    "stormy weather", "rainbow after rain", "first snowfall", "hot summer day",
    "cool autumn breeze", "spring flowers bloom", "thunder and lightning",
    "foggy morning", "icy cold winter", "weather forecast fun",
  ],
  vehicles: [
    "buses and cars", "trains on the track", "airplanes in the sky",
    "boats on the water", "fire trucks rushing", "ambulance siren",
    "police car zooming", "bicycle riding", "school bus yellow",
    "helicopter spinning", "dump truck working", "tractor on the farm",
    "rocket to the moon", "submarine deep dive", "hot air balloon",
  ],
  food: [
    "apples and bananas", "colors of fruit", "vegetable garden",
    "milk and cookies", "bread and butter", "pizza party",
    "ice cream truck", "banana splits", "berries so sweet",
    "carrots are crunchy", "broccoli trees", "corn on the cob",
    "pasta spirals", "juice so fresh", "breakfast time",
  ],
  family: [
    "mommy and daddy", "baby brother", "baby sister", "grandma and grandpa",
    "uncle and auntie", "cousins playing", "family dinner time",
    "going to the park together", "family car ride", "reading with mommy",
    "dancing with daddy", "grandma's house", "family photo day",
    "helping at home", "love in our family",
  ],
  opposites: [
    "big and small", "tall and short", "fast and slow", "up and down",
    "hot and cold", "happy and sad", "loud and quiet", "open and shut",
    "in and out", "on and off", "dry and wet", "light and dark",
    "clean and dirty", "hard and soft", "old and new",
  ],
  emotions: [
    "feeling happy", "feeling sad", "feeling angry", "feeling scared",
    "feeling excited", "feeling sleepy", "feeling hungry", "feeling brave",
    "feeling silly", "feeling shy", "feeling proud", "feeling loved",
    "feeling calm", "feeling surprised", "feeling thankful",
  ],
};

function getAllAnimals() {
  const seen = new Set();
  const animals = [];
  for (const category of Object.values(ANIMALS)) {
    for (const animal of category) {
      const key = animal.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        animals.push(animal);
      }
    }
  }
  return animals;
}

function getAllCategoryTopics() {
  const topics = [];
  for (const [categoryName, items] of Object.entries(CATEGORIES)) {
    for (const item of items) {
      topics.push({ topic: item, category: categoryName });
    }
  }
  return topics;
}

function makeRhymeTopic(topic, category, animalName = null, index) {
  return {
    id: `rhyme_${String(index).padStart(4, "0")}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    topic,
    category,
    animalName,
    used: false,
    scheduledDate: null,
  };
}

/**
 * Generates exactly 400 baby rhyme topics.
 * Animals first, then educational categories to fill remaining slots.
 * @returns {Array} array of 400 story objects
 */
export function generateRhymeTopics() {
  const stories = [];
  let index = 0;

  // Phase 1: All distinct animals (~150-200)
  const animals = getAllAnimals();
  for (const animal of animals) {
    stories.push(makeRhymeTopic(
      `The ${animal} song - nursery rhyme about a ${animal}`,
      "animal",
      animal,
      index++
    ));
  }

  // Phase 2: Animal combos and variations to reach ~200 animal topics
  const animalCombos = [
    "farm animals together", "sea creatures dance", "jungle animal parade",
    "pet animal friends", "bugs and insects march", "bird songs chorus",
    "reptile rock band", "zoo animal bingo", "animal alphabet",
    "animal counting", "animal colors", "animal shapes",
    "animal sounds around the world", "which animal am I", "animal families",
    "baby animals and their moms", "animals in the snow", "animals in the rain",
    "underwater animal party", "night time animals", "morning farm animals",
    "animals at the market", "animals in the city", "animals in space",
    "dancing animals", "sleepy animals", "hungry animals",
    "fast animals slow animals", "big animals small animals", "noisy animals quiet animals",
  ];
  for (const topic of animalCombos) {
    if (stories.length >= 200) break;
    stories.push(makeRhymeTopic(topic, "animal-mix", null, index++));
  }

  // Phase 3: Educational categories to fill up to 400
  const categoryTopics = getAllCategoryTopics();
  for (const { topic, category } of categoryTopics) {
    if (stories.length >= 400) break;
    stories.push(makeRhymeTopic(topic, category, null, index++));
  }

  // Phase 4: If still under 400, add general nursery topics
  const extras = [
    "bath time fun", "brushing teeth song", "putting on shoes",
    "washing hands", "tidy up the toys", "nap time song",
    "potty training song", "getting dressed", "hair brushing",
    "shopping with mommy", "birthday party", "playing in the park",
    "going to the zoo", "visiting the farm", "trip to the beach",
    "playing in the sandbox", "slide at the playground", "swing set fun",
    "building blocks", "puzzle time", "coloring with crayons",
    "playing catch", "hide and seek", "Simon says",
    "ring around the rosie", "peekaboo game", "patty cake",
    "itsy bitsy spider", "wheels on the bus", "old MacDonald",
    "twinkle little star", "row your boat", "humpty dumpty",
    "jack and jill", "mary had a little lamb", "baa baa black sheep",
    "hickory dickory dock", "mini mouse", "pat a cake",
    "rock a bye baby", "rain rain go away", "star light star bright",
    "this little piggy", "one two buckle my shoe", "three blind mice",
    "mary quite contrary", "little bo peep", "jack be nimble",
    "peter pumpkin eater", "there was an old lady", "rub-a-dub-dub",
    "diddle diddle dumpling", "wee willie winkie", "lucy locket",
    "dancing in the moonlight", "singing in the rain", "jumping jacks",
    "yoga for kids", "stretching song", "bouncing ball",
    "running race", "hop skip jump", "spinning around",
    "clapping game", "thumbelina", "goldilocks and three bears",
    "three little pigs", "little red riding hood", "jack and the beanstalk",
    "cinderella story", "peter pan adventure", "alice in wonderland",
    "snow white and seven dwarfs", "sleeping beauty", "beauty and the beast",
    "the little mermaid", "aladdin magic lamp", "lion king pride",
    "toy story friends", "finding nemo ocean", "frozen winter magic",
    "moana ocean adventure", "coco music magic", "up house adventure",
    "inside out feelings", "zootopia city", "cars racing fun",
    "incredibles family", "monsters inc laughs", "wall-e robot love",
    "ratatouille cooking", "brave scotland adventure", "tangled tower",
    "big hero 6 robots", "wreck it ralph game", "zombies dance",
    "descendants magic", "enchanted forest", "magic tree house",
    "paw patrol rescue", "blues clues hunt", "dora explorer",
    "bubble guppies splash", "team umizoomi math", "peppa pig mud",
    "paw patrol jet", "sponge bob pineapple", "dora map adventure",
    "blue's clues colors", "bubble guppies song", "team umizoomi numbers",
    "peppa's rainbow", "paw patrol characters", "sponge bob friends",
    "dora's backpack", "blue's backyard", "bubble guppies animals",
    "peppa's family", "paw patrol vehicles", "sponge bob square pants",
    "dora's adventure", "blue's birthday", "bubble guppies ocean",
    "peppa's house", "paw patrol tower", "sponge bob karate",
    "dora's friends", "blue's surprises", "bubble guppies dance",
    "peppa's school", "paw patrol bay", "sponge bob games",
    "dora's map", "blue's snail", "bubble guppies lunch",
    "peppa's garden", "paw patrol mayor", "sponge bob camp",
    "dora's star", "blue's mailbox", "bubble guppies library",
    "peppa's dinosaur", "paw patrol桔子", "sponge bob grilling",
    "dora's musical", "blue's plays", "bubble guppies parade",
    "peppa's bouncy castle", "paw patrol dragon", "sponge bob movie",
    "dora's detective", "blue's clues birthday", "bubble guppies pet",
    "peppa's bedtime", "paw patrol missions", "sponge bob world",
    "dora's dance", "blue's newspaper", "bubble guppies hotel",
    "peppa's camping", "paw patrol ocean", "sponge bob adventure",
    "dora's camping", "blue's play", "bubble guppies garden",
    "peppa's clinic", "paw patrol snow", "sponge bob night",
    "dora's winter", "blue's song", "bubble guppies farm",
    "peppa's swimming", "paw patrol fire", "sponge bob day",
  ];
  for (const topic of extras) {
    if (stories.length >= 400) break;
    stories.push(makeRhymeTopic(topic, "general", null, index++));
  }

  return stories.slice(0, 400);
}
