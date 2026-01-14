import { storage } from '@/services/storage';
import { generateId } from '@/utils/id-generator';
import type { User, Item, ItemCategory } from '@/types';

// Sample demo users
const DEMO_USERS: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    email: 'maria@demo.com',
    name: 'Maria Silva',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    isAnonymous: false,
  },
  {
    email: 'joao@demo.com',
    name: 'João Santos',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    isAnonymous: false,
  },
  {
    email: 'ana@demo.com',
    name: 'Ana Oliveira',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    isAnonymous: false,
  },
  {
    email: 'pedro@demo.com',
    name: 'Pedro Costa',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    isAnonymous: false,
  },
];

// Sample demo items
interface DemoItem {
  title: string;
  description: string;
  category: ItemCategory;
  photoUrl: string;
}

const DEMO_ITEMS: DemoItem[] = [
  {
    title: 'iPhone 12 Pro',
    description: 'iPhone 12 Pro 128GB, azul pacífico. Bateria 85%, sem arranhões. Acompanha carregador original.',
    category: 'electronics',
    photoUrl: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400',
  },
  {
    title: 'Jaqueta de Couro',
    description: 'Jaqueta de couro legítimo, tamanho M. Usada poucas vezes, em ótimo estado.',
    category: 'clothing',
    photoUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
  },
  {
    title: 'Coleção Harry Potter',
    description: 'Coleção completa dos 7 livros de Harry Potter em capa dura. Edição especial.',
    category: 'books',
    photoUrl: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400',
  },
  {
    title: 'Nintendo Switch',
    description: 'Nintendo Switch com Joy-cons vermelhos e azuis. Inclui 3 jogos e case de proteção.',
    category: 'electronics',
    photoUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',
  },
  {
    title: 'Tênis Nike Air Max',
    description: 'Tênis Nike Air Max 90, tamanho 42. Usado apenas 3 vezes, em perfeito estado.',
    category: 'clothing',
    photoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  },
  {
    title: 'Violão Yamaha',
    description: 'Violão acústico Yamaha C40, cordas de nylon. Ideal para iniciantes. Acompanha capa.',
    category: 'other',
    photoUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
  },
  {
    title: 'Mesa de Centro',
    description: 'Mesa de centro em madeira maciça, estilo rústico. Dimensões: 100x60x45cm.',
    category: 'furniture',
    photoUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400',
  },
  {
    title: 'Bicicleta Caloi',
    description: 'Bicicleta Caloi aro 26, 21 marchas. Perfeita para trilhas e cidade. Revisada recentemente.',
    category: 'sports',
    photoUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
  },
  {
    title: 'PlayStation 4',
    description: 'PS4 Slim 500GB com 2 controles e 5 jogos. Funcionando perfeitamente.',
    category: 'electronics',
    photoUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  },
  {
    title: 'Cafeteira Nespresso',
    description: 'Cafeteira Nespresso Inissia vermelha. Pouco usada, inclui kit de cápsulas.',
    category: 'home',
    photoUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400',
  },
  {
    title: 'Skate Element',
    description: 'Skate Element completo, shape 8.0. Rodas e rolamentos novos.',
    category: 'sports',
    photoUrl: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=400',
  },
  {
    title: 'Mochila North Face',
    description: 'Mochila North Face 40L, perfeita para viagens e trilhas. Vários compartimentos.',
    category: 'sports',
    photoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
  },
];

export async function seedDemoData(): Promise<{ users: User[]; items: Item[] }> {
  const USERS_KEY = '@rebox/users';
  const ITEMS_KEY = '@rebox/items';

  // Check if demo data already exists
  const existingUsers = await storage.getArray<User & { passwordHash: string }>(USERS_KEY);
  if (existingUsers.length > 0) {
    console.log('Demo data already exists, skipping seed');
    return { users: [], items: [] };
  }

  const now = Date.now();
  const users: (User & { passwordHash: string })[] = [];
  const items: Item[] = [];

  // Create demo users
  for (const demoUser of DEMO_USERS) {
    const user: User & { passwordHash: string } = {
      id: generateId(),
      ...demoUser,
      createdAt: now - Math.random() * 86400000 * 30, // Random time in last 30 days
      updatedAt: now,
      passwordHash: 'demo123', // Simple hash for demo
    };
    users.push(user);
  }

  // Create demo items (distribute among users)
  for (let i = 0; i < DEMO_ITEMS.length; i++) {
    const demoItem = DEMO_ITEMS[i];
    const userIndex = i % users.length;

    const item: Item = {
      id: generateId(),
      userId: users[userIndex].id,
      title: demoItem.title,
      description: demoItem.description,
      category: demoItem.category,
      photoUrl: demoItem.photoUrl,
      createdAt: now - Math.random() * 86400000 * 14, // Random time in last 14 days
      updatedAt: now,
    };
    items.push(item);
  }

  // Save to storage
  await storage.set(USERS_KEY, users);
  await storage.set(ITEMS_KEY, items);

  console.log(`Seeded ${users.length} users and ${items.length} items`);

  return {
    users: users.map(({ passwordHash, ...user }) => user),
    items,
  };
}

export async function clearAllData(): Promise<void> {
  await storage.clear();
  console.log('All data cleared');
}
