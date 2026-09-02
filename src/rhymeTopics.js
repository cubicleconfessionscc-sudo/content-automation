/**
 * Generates 700 unique baby rhyme topics.
 * Expansion: more animal species (~250 distinct), animal combos/sessions,
 * then deep educational sub-categories (routines, science, textures,
 * community helpers, counting variations, seasons, transport) — exactly 700.
 */

const ANIMALS = {
  farm: [
    "cow", "pig", "hen", "rooster", "duck", "goose", "horse", "sheep", "goat",
    "donkey", "turkey", "rabbit", "cat", "dog", "mouse", "rat", "calf", "lamb",
    "bull", "ox", "mule", "pony", "chicken", "chick", "pigeon", "crow",
    "quail", "pheasant", "guineafowl", "ostrich", "emu", "yak",
    "water buffalo", "peacock", "gander", "clucky hen",
  ],
  pets: [
    "dog", "cat", "rabbit", "hamster", "goldfish", "parakeet", "turtle",
    "guinea pig", "gerbil", "canary", "puppy", "kitten", "ferret", "chinchilla",
    "cockatiel", "lovebird", "hermit crab", "budgie", "axolotl",
    "sugar glider", "quokka", "parrotlet", "mice family", "hamster family",
  ],
  wild: [
    "lion", "tiger", "elephant", "giraffe", "monkey", "zebra", "bear",
    "wolf", "fox", "deer", "moose", "elk", "bison", "rhino", "hippo",
    "gorilla", "chimpanzee", "orangutan", "panda", "koala", "kangaroo",
    "camel", "llama", "alpaca", "antelope", "gazelle", "leopard", "cheetah",
    "hyena", "jackal", "meerkat", "raccoon", "squirrel", "hedgehog", "badger",
    "porcupine", "skunk", "otter", "beaver", "muskrat", "possum", "armadillo",
    "sloth", "tapir", "wild boar", "warthog", "mongoose", "walrus",
    "capybara", "wombat", "platypus", "echidna", "red panda", "sun bear",
    "puma", "serval", "ocelot", "caracal", "binturong", "tamarin",
    "marmoset", "baboon", "mandrill", "gibbon", "lemur", "aye-aye",
    "pangolin", "okapi", "kudu", "impala", "wildebeest", "oryx",
    "ibex", "mountain goat", "cape buffalo", "tapir calf",
  ],
  sea: [
    "whale", "shark", "dolphin", "octopus", "crab", "lobster", "seahorse",
    "jellyfish", "starfish", "clam", "oyster", "mussel", "squid", "seal",
    "sea lion", "manatee", "turtle", "ray", "barracuda", "swordfish",
    "pufferfish", "angelfish", "coral", "barnacle", "urchin",
    "clownfish", "blue tang", "cuttlefish", "nautilus", "orca", "beluga",
    "narwhal", "sea otter", "dugong", "manta ray", "lionfish",
    "salmon", "trout", "herring", "mackerel", "tuna", "grouper",
    "snapper", "sardine", "anchovy", "prawn", "shrimp",
  ],
  birds: [
    "owl", "parrot", "penguin", "eagle", "hawk", "falcon", "sparrow",
    "robin", "blue jay", "cardinal", "hummingbird", "pelican", "flamingo",
    "swan", "goose", "crane", "stork", "woodpecker", "kingfisher", "kiwi",
    "toucan", "crow", "raven", "magpie", "nightingale", "lark",
    "seagull", "puffin", "albatross", "condor", "vulture", "buzzard",
    "kite", "osprey", "kestrel", "macaw", "cockatoo", "finch",
    "starling", "thrush", "swallow", "swift", "chickadee", "wren",
    "oriole", "tanager", "heron", "egret", "ibis", "bittern",
    "hen harrier", "sandpiper", "plover", "lapwing",
  ],
  insects: [
    "bee", "butterfly", "ant", "ladybug", "dragonfly", "grasshopper",
    "cricket", "caterpillar", "beetle", "firefly", "moth", "wasp", "mosquito",
    "cockroach", "termite", "mantis", "flea", "tick", "spider", "scorpion",
    "centipede", "millipede", "snail", "slug", "worm", "pill bug",
    "stick insect", "leaf insect", "katydid", "cicada", "aphid",
    "lacewing", "mayfly", "earwig", "silverfish", "honeybee",
  ],
  reptiles: [
    "turtle", "frog", "toad", "snake", "lizard", "gecko", "iguana",
    "chameleon", "crocodile", "alligator", "tortoise", "salamander",
    "newt", "Komodo dragon", "monitor lizard", "cobra", "rattlesnake",
    "anaconda", "boa", "mamba", "adder", "viper", "caiman", "gavial",
    "skink", "tegu", "bearded dragon", "anole", "basilisk lizard",
    "terrapin", "box turtle", "leopard frog",
  ],
  arctic: [
    "polar bear", "arctic fox", "reindeer", "caribou", "arctic hare",
    "harp seal", "leopard seal", "snowy owl", "ptarmigan", "musk ox",
    "ermine", "arctic tern",
  ],
  extinct: [
    "T-Rex", "triceratops", "stegosaurus", "brachiosaurus", "velociraptor",
    "diplodocus", "ankylosaurus", "spinosaurus", "parasaurolophus",
    "pterodactyl", "pteranodon", "archaeopteryx", "apatosaurus",
    "iguanodon", "pachycephalosaurus",
  ],
};

const CATEGORIES = {
  counting: [
    "counting 1 to 10", "counting 1 to 20", "counting by 2s", "counting by 5s",
    "counting by 10s", "counting backwards from 10", "counting fingers and toes",
    "how many wheels", "counting stars in the sky", "counting fish in the sea",
    "counting apples on the tree", "counting bubbles", "counting birds on a wire",
    "counting clouds", "counting flowers in the garden",
    "counting ladybugs", "counting balloons", "counting cookies how many",
    "counting jellybeans", "counting teddy bears", "counting rockets",
    "counting the days till my birthday", "counting trees in the park",
    "counting raindrops", "ten little monkeys zero",
  ],
  counting_animals: [
    "counting ducks on the pond", "counting sheep before sleep",
    "counting cows in the field", "counting chickens in the coop",
    "counting puppies under the table", "counting kittens at play",
    "counting ants on a march", "counting honeybees on flowers",
    "counting starfish on the sand", "counting turtles on the beach",
    "counting elephants marching", "counting lions in the den",
    "counting rabbits in the garden", "counting penguins on the ice",
    "counting butterflies in flight",
  ],
  colors: [
    "the color red", "the color blue", "the color green", "the color yellow",
    "the color orange", "the color purple", "the color pink", "the color brown",
    "the color black", "the color white", "the color rainbow", "mixing colors",
    "primary colors", "warm and cool colors", "my favorite color",
    "colors in the garden", "colors in the ocean", "colors on the farm",
    "colorful fruit salad", "the color turquoise",
  ],
  shapes: [
    "circles everywhere", "squares all around", "triangles in the sky",
    "rectangles and doors", "stars twinkling bright", "hearts are for love",
    "diamonds in the ring", "ovals like an egg", "pentagon and hexagon",
    "shapes in the house", "shapes at the park", "shapes in outer space",
    "building with shapes", "shapes in the ocean", "shapes on the road",
    "crescent moon shape", "octagon stop signs", "springy spirals",
  ],
  alphabet: [
    "letter A", "letter B", "letter C", "letter D", "letter E", "letter F",
    "letter G", "letter H", "letter I", "letter J", "letter K", "letter L",
    "letter M", "letter N", "letter O", "letter P", "letter Q", "letter R",
    "letter S", "letter T", "letter U", "letter V", "letter W", "letter X",
    "letter Y", "letter Z", "the whole alphabet", "vowels song",
    "consonant sounds", "learning to write letters", "alphabet animals",
    "alphabet foods", "alphabet in the kitchen",
  ],
  time: [
    "days of the week", "months of the year", "telling time with clocks",
    "morning routine", "afternoon fun", "bedtime routine", "seasons changing",
    "what comes after Monday", "yesterday today tomorrow", "how weeks work",
    "what time do we eat lunch", "the very first clock",
  ],
  body: [
    "head shoulders knees and toes", "my two eyes", "my little nose",
    "ten tiny fingers", "my bouncing legs", "clap your hands",
    "stomp your feet", "wave hello goodbye", "my happy mouth",
    "ears that listen", "hair on my head", "my tummy rumbles",
    "wiggly toes and wiggly nose", "my strong arms", "my dancing hips",
  ],
  weather: [
    "sunny day", "rainy day", "snowy day", "windy day", "cloudy day",
    "stormy weather", "rainbow after rain", "first snowfall", "hot summer day",
    "cool autumn breeze", "spring flowers bloom", "thunder and lightning",
    "foggy morning", "icy cold winter", "weather forecast fun",
    "splash in the puddles", "shine on sunny morning",
  ],
  seasons: [
    "spring has come", "summer is so hot", "autumn leaves falling",
    "winter is so cool", "planting seeds in spring", "ice skating in winter",
    "swimming at the pool", "fall harvest time", "the season of new leaves",
    "baking in the autumn", "building a snowman", "splash in summer sun",
  ],
  vehicles: [
    "buses and cars", "trains on the track", "airplanes in the sky",
    "boats on the water", "fire trucks rushing", "ambulance siren",
    "police car zooming", "bicycle riding", "school bus yellow",
    "helicopter spinning", "dump truck working", "tractor on the farm",
    "rocket to the moon", "submarine deep dive", "hot air balloon",
    "race cars zoom zoom", "monster trucks jumping", "cranes lifting high",
    "motorcycles vroom", "scooters and skateboards", "subway trains under city",
    "big ships on the sea", "sailing with the wind",
  ],
  transport_helpers: [
    "the bus driver", "the train conductor", "the pilot flying",
    "the ship captain", "the delivery truck driver", "the mail carrier van",
  ],
  food: [
    "apples and bananas", "colors of fruit", "vegetable garden",
    "milk and cookies", "bread and butter", "pizza party",
    "ice cream truck", "banana splits", "berries so sweet",
    "carrots are crunchy", "broccoli trees", "corn on the cob",
    "pasta spirals", "juice so fresh", "breakfast time",
    "peanut butter sandwich", "soup is warm and yummy", "salad in a bowl",
    "watermelon slices", "grapes by the bunch",
  ],
  family: [
    "mommy and daddy", "baby brother", "baby sister", "grandma and grandpa",
    "uncle and auntie", "cousins playing", "family dinner time",
    "going to the park together", "family car ride", "reading with mommy",
    "dancing with daddy", "grandma's house", "family photo day",
    "helping at home", "love in our family",
    "playing with my big brother", "a hug from mommy", "a kiss from daddy",
  ],
  opposites: [
    "big and small", "tall and short", "fast and slow", "up and down",
    "hot and cold", "happy and sad", "loud and quiet", "open and shut",
    "in and out", "on and off", "dry and wet", "light and dark",
    "clean and dirty", "hard and soft", "old and new",
  ],
  textures: [
    "heavy and light", "rough and smooth", "bumpy and flat",
    "sticky and gooey", "shiny and dull", "round and pointy",
    "squishy and firm", "fluffy and scratchy", "slimy but fun",
    "stretchy like a band", "crunchy and soft", "feathery and furry",
  ],
  emotions: [
    "feeling happy", "feeling sad", "feeling angry", "feeling scared",
    "feeling excited", "feeling sleepy", "feeling hungry", "feeling brave",
    "feeling silly", "feeling shy", "feeling proud", "feeling loved",
    "feeling calm", "feeling surprised", "feeling thankful",
    "it's okay to cry", "taking a deep breath",
  ],
  routines: [
    "bath time with bubbles", "bedtime story time", "brushing my teeth",
    "washing my hands", "sharing my toys", "saying please",
    "saying thank you", "tidying up my room", "getting dressed",
    "nap time cuddles", "potty time success", "putting on my shoes",
    "combing my hair", "setting the table", "packing my backpack",
  ],
  manners: [
    "please and thank you song", "excuse me, may I", "sharing is caring",
    "waiting my turn", "helping a friend", "listening ears on",
    "kind words from my heart", "greeting good morning", "saying sorry",
    "being polite at the table",
  ],
  science: [
    "day and night", "the sun rises up", "why the rain falls down",
    "water and ice", "sink or float", "magnets and metal",
    "my shadow follows me", "the moon in the night", "stars twinkle far away",
    "growing a little seed", "butterfly life cycle", "frog life cycle",
    "why leaves change color", "how a rainbow forms", "bubbles in the air",
    "where does the wind go", "how plants drink water", "the spinning earth",
  ],
  community: [
    "the kind doctor", "the helpful nurse", "my sweet teacher",
    "the brave firefighter", "the friendly mail carrier", "the neighborhood cop",
    "the chef in the kitchen", "the builder with bricks", "the farmer feeds animals",
    "the pilot in the sky", "the astronaut in space", "the zookeeper cares",
    "the vet helps pets", "the librarian with books", "the barber trims hair",
  ],
  nursery: [
    "pat a cake pat a cake", "a little round balloon", "high up on the swing",
    "down the slide we go", "building pillow forts", "playing with my teddy",
    "hide and seek fun", "ring around the sun", "peekaboo I see you",
    "dance dance dance around", "jump jump jump up high",
    "roll the ball to me", "catch the bubble", "marching around the room",
  ],
};

const ANIMAL_COMBOS = [
  "farm animals together", "sea creatures dance", "jungle animal parade",
  "pet animal friends", "bugs and insects march", "bird songs chorus",
  "reptile rock band", "zoo animal bingo", "arctic animals slide",
  "dinosaur stomp stomp", "baby animals and their moms", "animals in the snow",
  "animals in the rain", "underwater animal party", "night time animals",
  "morning farm animals", "animals at the market", "animals in the city",
  "animals in space", "dancing animals", "sleepy animals", "hungry animals",
  "fast animals slow animals", "big animals small animals", "noisy animals quiet animals",
];

const ANIMAL_SESSIONS = [
  "counting farm animals", "counting sea creatures", "counting jungle animals",
  "counting bugs and insects", "animal alphabet song", "animal colors song",
  "animal sounds around the world", "which animal am I", "animal families",
  "animal footprints in the mud", "zoo trip with friends", "feeding time at the farm",
  "animal names from A to Z", "animals that hop", "animals that fly",
  "animals that swim", "animals that crawl", "animals that run fast",
  "gentle animals and friendly animals", "what do animals eat",
  "where do animals live", "animal homes in nature", "friends in the forest",
];

const ANIMAL_VARIATIONS = [
  "counts to ten", "goes to sleep", "plays with friends", "learns to share",
  "has a birthday party", "goes to the park", "splashes in the rain",
  "makes new friends", "cleans up the mess", "says good morning",
  "goes on an adventure", "learns to be brave", "helps a friend in need",
  "dances all day long", "finds a happy ending",
];

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
 * Generates exactly 700 baby rhyme topics.
 * Phase 1: ~250 distinct animals. Phase 2: animal combos + sessions.
 * Phase 3: deep educational categories. Phase 4: animal routine variations to fill.
 * @returns {Array} 700 story objects
 */
export function generateRhymeTopics() {
  const stories = [];
  let index = 0;
  const push = (topic, category, animalName = null) => {
    stories.push(makeRhymeTopic(topic, category, animalName, index++));
  };

  const animals = getAllAnimals();
  for (const animal of animals) {
    push(`The ${animal} song - nursery rhyme about a ${animal}`, "animal", animal);
  }

  for (const topic of ANIMAL_COMBOS) push(topic, "animal-mix");
  for (const topic of ANIMAL_SESSIONS) push(topic, "animal-session");

  for (const [categoryName, items] of Object.entries(CATEGORIES)) {
    if (stories.length >= 700) break;
    for (const item of items) {
      if (stories.length >= 700) break;
      push(item, categoryName);
    }
  }

  let v = 0;
  while (stories.length < 700) {
    const animal = animals[v % animals.length];
    const variation = ANIMAL_VARIATIONS[Math.floor(v / animals.length) % ANIMAL_VARIATIONS.length];
    push(`${animal} ${variation}`, "animal-variation", animal);
    v++;
  }

  return stories.slice(0, 700);
}