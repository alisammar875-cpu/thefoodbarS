import { collection, doc, setDoc, getDocs, query, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const seedDatabase = async (force = false) => {
  try {
    const itemsRef = collection(db, 'menu_items');
    const snap = await getDocs(query(itemsRef, limit(60)));
    
    if (snap.size >= 50 && !force) {
      console.log('Database already has sufficient items.');
      return;
    }

    console.log('Seeding database with 60+ items...');

    const categories = [
      { id: 'c_burgers', name: "Burgers", emoji: "🍔", slug: "burgers", displayOrder: 1 },
      { id: 'c_wraps', name: "Wraps", emoji: "🌯", slug: "wraps", displayOrder: 2 },
      { id: 'c_pizza', name: "Pizza", emoji: "🍕", slug: "pizza", displayOrder: 3 },
      { id: 'c_fries', name: "Fries & Sides", emoji: "🍟", slug: "fries", displayOrder: 4 },
      { id: 'c_drinks', name: "Drinks", emoji: "🥤", slug: "drinks", displayOrder: 5 },
      { id: 'c_desserts', name: "Desserts", emoji: "🍰", slug: "desserts", displayOrder: 6 },
      { id: 'c_deals', name: "Deals", emoji: "🏷️", slug: "deals", displayOrder: 7 }
    ];

    for (const cat of categories) {
      await setDoc(doc(db, 'categories', cat.id), cat);
    }

    const menuItems = [
      // ═══ BURGERS (12) ═══
      { name: 'OG Smash Burger', price: 590, category: 'Burgers', tags: ['bestseller'], imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop' },
      { name: 'Double Cheese Dynamite', price: 790, category: 'Burgers', tags: ['featured', 'spicy'], imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop' },
      { name: 'Truffle Mushroom Swiss', price: 850, category: 'Burgers', tags: ['new'], imageUrl: 'https://images.unsplash.com/photo-1550317144-b38c5ef69953?q=80&w=800&auto=format&fit=crop' },
      { name: 'Smoky BBQ Brisket Burger', price: 950, category: 'Burgers', tags: ['featured'], imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800&auto=format&fit=crop' },
      { name: 'Ghost Pepper Inferno', price: 720, category: 'Burgers', tags: ['spicy'], imageUrl: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=800&auto=format&fit=crop' },
      { name: 'Classic Zinger Stacker', price: 650, category: 'Burgers', tags: ['bestseller'], imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop' },
      { name: 'Breakfast Egg Burger', price: 550, category: 'Burgers', tags: ['new'], imageUrl: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?q=80&w=800&auto=format&fit=crop' },
      { name: 'Avocado Green Burger', price: 890, category: 'Burgers', tags: ['veg'], imageUrl: 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?q=80&w=800&auto=format&fit=crop' },
      { name: 'Bacon Beef Overload', price: 990, category: 'Burgers', tags: ['featured'], imageUrl: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?q=80&w=800&auto=format&fit=crop' },
      { name: 'The Hulk Double Smashed', price: 1150, category: 'Burgers', tags: ['featured', 'bestseller'], imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800&auto=format&fit=crop' },
      { name: 'Crispy Fish Fillet', price: 680, category: 'Burgers', tags: [], imageUrl: 'https://images.unsplash.com/photo-1536510233921-8e5043fce771?q=80&w=800&auto=format&fit=crop' },
      { name: 'Paneer Tikka Burger', price: 490, category: 'Burgers', tags: ['veg', 'spicy'], imageUrl: 'https://images.unsplash.com/photo-1628815870980-f416105d89b3?q=80&w=800&auto=format&fit=crop' },

      // ═══ WRAPS (10) ═══
      { name: 'Grilled Chicken Caesar Wrap', price: 480, category: 'Wraps', tags: ['bestseller'], imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=800&auto=format&fit=crop' },
      { name: 'Spicy Buffalo Chicken Wrap', price: 520, category: 'Wraps', tags: ['spicy', 'featured'], imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=800&auto=format&fit=crop' },
      { name: 'Falafel Hummus Wrap', price: 420, category: 'Wraps', tags: ['veg'], imageUrl: 'https://images.unsplash.com/photo-1541518763669-27f90a7e4ae0?q=80&w=800&auto=format&fit=crop' },
      { name: 'Steak & Cheese Wrap', price: 690, category: 'Wraps', tags: ['featured'], imageUrl: 'https://images.unsplash.com/photo-1610393742736-72b018534062?q=80&w=800&auto=format&fit=crop' },
      { name: 'Crispy Mayo Chicken Wrap', price: 450, category: 'Wraps', tags: ['bestseller'], imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=800&auto=format&fit=crop' },
      { name: 'Thai Sweet Chili Wrap', price: 490, category: 'Wraps', tags: ['spicy'], imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=800&auto=format&fit=crop' },
      { name: 'Greek Gyro Wrap', price: 580, category: 'Wraps', tags: ['new'], imageUrl: 'https://images.unsplash.com/photo-1633345242701-9a74f4b9319e?q=80&w=800&auto=format&fit=crop' },
      { name: 'Peri Peri Grilled Wrap', price: 540, category: 'Wraps', tags: ['spicy', 'bestseller'], imageUrl: 'https://images.unsplash.com/photo-1628191081676-8f40d4ce6c44?q=80&w=800&auto=format&fit=crop' },
      { name: 'BBQ Pulled Chicken Wrap', price: 560, category: 'Wraps', tags: [], imageUrl: 'https://images.unsplash.com/photo-1547050605-2f4703a1656e?q=80&w=800&auto=format&fit=crop' },
      { name: 'Veggie Paneer Wrap', price: 460, category: 'Wraps', tags: ['veg'], imageUrl: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?q=80&w=800&auto=format&fit=crop' },

      // ═══ PIZZA (10) ═══
      { name: 'Ultimate Pepperoni Feast', price: 950, category: 'Pizza', tags: ['bestseller', 'featured'], imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop' },
      { name: 'Smoky BBQ Chicken Pizza', price: 890, category: 'Pizza', tags: ['featured'], imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop' },
      { name: 'Garden Veggie Supreme', price: 780, category: 'Pizza', tags: ['veg'], imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=800&auto=format&fit=crop' },
      { name: 'Tandoori Hot Pizza', price: 850, category: 'Pizza', tags: ['spicy'], imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop' },
      { name: 'Classic Margherita', price: 690, category: 'Pizza', tags: ['veg', 'bestseller'], imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop' },
      { name: 'Meat Lovers Combo', price: 1150, category: 'Pizza', tags: ['featured'], imageUrl: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=800&auto=format&fit=crop' },
      { name: 'Hawaiian Bliss Pizza', price: 820, category: 'Pizza', tags: ['new'], imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop' },
      { name: 'Buffalo Chicken Blast', price: 920, category: 'Pizza', tags: ['spicy'], imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=800&auto=format&fit=crop' },
      { name: 'Four Cheese Special', price: 980, category: 'Pizza', tags: ['veg', 'featured'], imageUrl: 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?q=80&w=800&auto=format&fit=crop' },
      { name: 'Mushroom & Olive Delight', price: 840, category: 'Pizza', tags: ['veg'], imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=800&auto=format&fit=crop' },

      // ═══ FRIES & SIDES (12) ═══
      { name: 'Signature Animal Fries', price: 450, category: 'Fries & Sides', tags: ['bestseller', 'featured'], imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=800&auto=format&fit=crop' },
      { name: 'Cheesy Garlic Bread', price: 320, category: 'Fries & Sides', tags: ['bestseller'], imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=800&auto=format&fit=crop' },
      { name: 'Dynamite Chicken Wings', price: 580, category: 'Fries & Sides', tags: ['spicy', 'featured'], imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=800&auto=format&fit=crop' },
      { name: 'Mozzarella Sticks (6pcs)', price: 420, category: 'Fries & Sides', tags: ['bestseller'], imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop' },
      { name: 'Loaded Nachos Grande', price: 550, category: 'Fries & Sides', tags: ['new'], imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=800&auto=format&fit=crop' },
      { name: 'Peri Peri Fries Large', price: 280, category: 'Fries & Sides', tags: ['spicy'], imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=800&auto=format&fit=crop' },
      { name: 'Chicken Tenders Basket', price: 520, category: 'Fries & Sides', tags: ['bestseller'], imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop' },
      { name: 'Onion Rings Tower', price: 290, category: 'Fries & Sides', tags: [], imageUrl: 'https://images.unsplash.com/photo-1639024471201-120eb81dcafb?q=80&w=800&auto=format&fit=crop' },
      { name: 'Jalapeno Poppers (5pcs)', price: 380, category: 'Fries & Sides', tags: ['spicy'], imageUrl: 'https://images.unsplash.com/photo-1611003228941-98a5d61996ad?q=80&w=800&auto=format&fit=crop' },
      { name: 'Cajun Potato Wedges', price: 260, category: 'Fries & Sides', tags: [], imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=800&auto=format&fit=crop' },
      { name: 'Sweet Potato Fries', price: 350, category: 'Fries & Sides', tags: ['new'], imageUrl: 'https://images.unsplash.com/photo-1526230427044-d39459a24585?q=80&w=800&auto=format&fit=crop' },
      { name: 'Mac N Cheese Bites', price: 390, category: 'Fries & Sides', tags: [], imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=800&auto=format&fit=crop' },

      // ═══ DRINKS (10) ═══
      { name: 'Chocolate Heaven Shake', price: 450, category: 'Drinks', tags: ['bestseller', 'featured'], imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75bb827?q=80&w=800&auto=format&fit=crop' },
      { name: 'Vanilla Bean Shake', price: 420, category: 'Drinks', tags: [], imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28be0?q=80&w=800&auto=format&fit=crop' },
      { name: 'Strawberry Swirl Shake', price: 420, category: 'Drinks', tags: [], imageUrl: 'https://images.unsplash.com/photo-1543648964-139617ee3f23?q=80&w=800&auto=format&fit=crop' },
      { name: 'Cookies & Cream Shake', price: 480, category: 'Drinks', tags: ['bestseller'], imageUrl: 'https://images.unsplash.com/photo-1553784181-277ad0b9cc5c?q=80&w=800&auto=format&fit=crop' },
      { name: 'Blue Lagoon Mocktail', price: 350, category: 'Drinks', tags: ['new'], imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop' },
      { name: 'Peach Iced Tea', price: 280, category: 'Drinks', tags: [], imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop' },
      { name: 'Mint Margarita', price: 250, category: 'Drinks', tags: ['bestseller'], imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop' },
      { name: 'Cold Coffee Frappe', price: 390, category: 'Drinks', tags: ['featured'], imageUrl: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=800&auto=format&fit=crop' },
      { name: 'Fresh Lime Soda', price: 180, category: 'Drinks', tags: [], imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop' },
      { name: 'Imported Energy Drink', price: 450, category: 'Drinks', tags: [], imageUrl: 'https://images.unsplash.com/photo-1622484210802-19bc3034a410?q=80&w=800&auto=format&fit=crop' },

      // ═══ DESSERTS (6) ═══
      { name: 'Warm Choco Lava Cake', price: 380, category: 'Desserts', tags: ['bestseller', 'featured'], imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=800&auto=format&fit=crop' },
      { name: 'New York Cheesecake', price: 450, category: 'Desserts', tags: ['featured'], imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop' },
      { name: 'Nutella Waffle Bowl', price: 520, category: 'Desserts', tags: ['new'], imageUrl: 'https://images.unsplash.com/photo-1518057111178-44a106bad636?q=80&w=800&auto=format&fit=crop' },
      { name: 'Classic Tiramisu', price: 490, category: 'Desserts', tags: [], imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800&auto=format&fit=crop' },
      { name: 'Red Velvet Pastry', price: 350, category: 'Desserts', tags: [], imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?q=80&w=800&auto=format&fit=crop' },
      { name: 'Hot Sizzling Brownie', price: 550, category: 'Desserts', tags: ['bestseller'], imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=800&auto=format&fit=crop' },

      // ═══ DEALS (6) ═══
      { name: 'Solo Smash Deal', price: 850, category: 'Deals', tags: ['featured'], imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop' },
      { name: 'Duo Dynamite Combo', price: 1550, category: 'Deals', tags: ['bestseller'], imageUrl: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=800&auto=format&fit=crop' },
      { name: 'Family Pizza Party', price: 2450, category: 'Deals', tags: ['featured'], imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop' },
      { name: 'Wrappers Delight Pack', price: 1250, category: 'Deals', tags: ['new'], imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=800&auto=format&fit=crop' },
      { name: 'Sides Sensation Platter', price: 990, category: 'Deals', tags: [], imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=800&auto=format&fit=crop' },
      { name: 'Grand Food Bar Feast', price: 4500, category: 'Deals', tags: ['featured'], imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop' }
    ];

    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];
      const data = {
        ...item,
        description: `${item.name} is prepared using our secret recipe and premium ingredients. Guaranteed to satisfy your cravings.`,
        shortDescription: `Our famous ${item.name} is a crowd favorite!`,
        isAvailable: true,
        isFeatured: item.tags.includes('featured'),
        isNew: item.tags.includes('new'),
        averageRating: 4.5 + (Math.random() * 0.5),
        reviewCount: Math.floor(Math.random() * 200) + 50,
        prepTimeMinutes: item.category === 'Pizza' ? 25 : 15,
        calories: Math.floor(Math.random() * 600) + 200,
        createdAt: new Date()
      };
      await setDoc(doc(db, 'menu_items', `m_${i+1}`), data);
    }

    const config = {
      deliveryFee: 100,
      estimatedDelivery: "30-45 minutes",
      isAcceptingOrders: true,
      announcementBanner: "🔥 FLAT 20% OFF on your first order! Use code: HELLOFOOD",
      contactEmail: "hello@thefoodbar.com",
      contactPhone: "+92-300-1234567",
      socialLinks: { instagram: 'https://instagram.com', facebook: 'https://facebook.com', tiktok: 'https://tiktok.com', twitter: 'https://twitter.com' }
    };
    await setDoc(doc(db, 'site_config', 'main'), config);

    console.log(`Database seeded successfully with ${menuItems.length} items!`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
