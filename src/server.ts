import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import fs from 'node:fs';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json());

const angularApp = new AngularNodeAppEngine();

const DB_FILE = './harmy_database.json';

// Initialize full-fidelity mock database
interface User {
  id: string;
  displayName: string;
  email: string;
  role: 'seamstress' | 'customer' | 'admin';
  photoURL: string;
  phone: string;
  whatsapp: string;
  atelierId: string | null;
  subscription: {
    status: 'active' | 'inactive';
    plan: string;
    renewalDate: string;
  };
  createdAt: string;
}

interface Atelier {
  id: string;
  ownerId: string;
  name: string;
  location: { city: string; country: string };
  bio: string;
  pricing: string;
  portfolioCoverURL: string;
  createdAt: string;
  rating: number;
  reviews: { authorName: string; rating: number; text: string; createdAt: string }[];
}

interface CustomerAtelier {
  id: string;
  atelierId: string;
  type: 'local' | 'registered';
  registeredUserId: string | null;
  name: string;
  phone: string;
  notes: string;
  measurements: { bust: number; waist: number; hips: number; arm: number };
  createdAt: string;
}

interface MeasureBook {
  customerUserId: string;
  measurements: { bust: number; waist: number; hips: number; arm: number };
  shares: string[]; // array of atelierIds
  updatedAt: string;
}

interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  atelierId: string;
  caption: string;
  priceHint: number;
  currency: string;
  tags: string[];
  media: string[];
  likeCount: number;
  commentCount: number;
  likes: string[]; // uids
  comments: Comment[];
  createdAt: string;
}

interface Order {
  id: string;
  atelierId: string;
  customerRefId: string;
  customerName: string;
  customerPhone: string;
  customerType: 'local' | 'registered';
  modelPostId: string | null;
  modelCaption: string;
  status: 'FABRIC_RECEIVED' | 'SEWING' | 'FITTING_READY' | 'DELIVERED' | 'ARCHIVED';
  fabricReceived: boolean;
  dueDate: string;
  pricing: { total: number; deposit: number; balance: number; currency: string };
  timestamps: { createdAt: string; updatedAt: string; deliveredAt: string | null };
  events: { type: string; byUserId: string; text: string; createdAt: string }[];
}

interface Message {
  id: string;
  conversationId: string;
  from: string;
  type: 'text' | 'image';
  text: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  members: string[]; // [customerUserId, seamstressUserId]
  memberDetails: Record<string, { name: string; photoURL: string; role: string }>;
  atelierId: string;
  lastMessageAt: string;
  lastMessagePreview: string;
}

interface Task {
  id: string;
  atelierId: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

interface Report {
  id: string;
  postId: string;
  postTitle: string;
  reason: string;
  reportedBy: string;
  createdAt: string;
}

interface DB {
  users: User[];
  ateliers: Atelier[];
  customers: CustomerAtelier[];
  measureBooks: MeasureBook[];
  posts: Post[];
  orders: Order[];
  conversations: Conversation[];
  messages: Message[];
  tasks: Task[];
  reports: Report[];
}

function loadDB(): DB {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
      console.error("Error reading database file, resetting...", e);
    }
  }

  // Generate gorgeous pre-seeded data for the African sewing marketplace and atelier suite
  const users: User[] = [
    {
      id: 'seamstress_1',
      displayName: 'Fatoumata Diallo',
      email: 'fatoumata@harmysewing.com',
      role: 'seamstress',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: '+221 77 123 45 67',
      whatsapp: 'https://wa.me/221771234567',
      atelierId: 'atelier_1',
      subscription: { status: 'active', plan: 'Atelier Premium', renewalDate: '2026-12-31' },
      createdAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'seamstress_2',
      displayName: 'Awa Koné',
      email: 'awa@prestigewax.com',
      role: 'seamstress',
      photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      phone: '+225 07 456 78 90',
      whatsapp: 'https://wa.me/225074567890',
      atelierId: 'atelier_2',
      subscription: { status: 'active', plan: 'Atelier Premium', renewalDate: '2026-11-30' },
      createdAt: '2026-02-15T09:30:00Z',
    },
    {
      id: 'customer_1',
      displayName: 'Amina Bello',
      email: 'amina@gmail.com',
      role: 'customer',
      photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      phone: '+234 803 123 4567',
      whatsapp: 'https://wa.me/2348031234567',
      atelierId: null,
      subscription: { status: 'inactive', plan: 'free', renewalDate: '' },
      createdAt: '2026-03-01T14:20:00Z',
    },
    {
      id: 'customer_2',
      displayName: 'Mariama Sylla',
      email: 'mariama@outlook.com',
      role: 'customer',
      photoURL: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150',
      phone: '+221 70 987 65 43',
      whatsapp: 'https://wa.me/221709876543',
      atelierId: null,
      subscription: { status: 'inactive', plan: 'free', renewalDate: '' },
      createdAt: '2026-03-05T16:45:00Z',
    },
    {
      id: 'admin_1',
      displayName: 'Harmonie Nankaf',
      email: 'nankafuharmonie@gmail.com',
      role: 'admin',
      photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
      phone: '+33 6 12 34 56 78',
      whatsapp: '',
      atelierId: null,
      subscription: { status: 'inactive', plan: 'free', renewalDate: '' },
      createdAt: '2026-01-01T08:00:00Z',
    }
  ];

  const ateliers: Atelier[] = [
    {
      id: 'atelier_1',
      ownerId: 'seamstress_1',
      name: 'Maison de Couture Harmy\'sewing',
      location: { city: 'Dakar', country: 'Sénégal' },
      bio: 'Spécialiste de la haute couture africaine traditionnelle et moderne. Confections d\'exception en Wax hollandais, Bazin riche et dentelles de luxe pour toutes vos cérémonies de prestige.',
      pricing: 'Robes simples à partir de 15,000 XOF. Ensembles grand boubou à partir de 35,000 XOF.',
      portfolioCoverURL: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      createdAt: '2026-01-10T10:15:00Z',
      rating: 4.8,
      reviews: [
        { authorName: 'Amina Bello', rating: 5, text: 'Un travail d\'une précision incroyable. Les finitions du grand boubou sont impeccables !', createdAt: '2026-04-10T15:00:00Z' },
        { authorName: 'Kadiatou Touré', rating: 4, text: 'Très satisfaite de ma commande de mariage. Je recommande vivement Fatoumata !', createdAt: '2026-05-18T10:00:00Z' }
      ]
    },
    {
      id: 'atelier_2',
      ownerId: 'seamstress_2',
      name: 'Atelier Prestige Wax',
      location: { city: 'Abidjan', country: 'Côte d\'Ivoire' },
      bio: 'Créatrice engagée pour la valorisation du pagne africain. Combinaisons modernes, jupes crayons et costumes sur mesure stylisés pour la femme active.',
      pricing: 'Jupes à partir de 8,000 XOF. Robes de soirée à partir de 25,000 XOF.',
      portfolioCoverURL: 'https://images.unsplash.com/photo-1572495537021-a67b12938b8b?w=800',
      createdAt: '2026-02-15T10:00:00Z',
      rating: 4.5,
      reviews: [
        { authorName: 'Mariama Sylla', rating: 5, text: 'La combinaison en Wax s\'ajuste parfaitement. Excellent rapport qualité/prix !', createdAt: '2026-05-20T12:00:00Z' }
      ]
    }
  ];

  const customers: CustomerAtelier[] = [
    {
      id: 'cust_local_1',
      atelierId: 'atelier_1',
      type: 'local',
      registeredUserId: null,
      name: 'Ramata Ndiaye (Cliente Locale)',
      phone: '+221 77 555 12 34',
      notes: 'Préfère les coupes cintrées. Habituellement réticente aux décolletés plongeants.',
      measurements: { bust: 92, waist: 74, hips: 102, arm: 32 },
      createdAt: '2026-02-01T11:00:00Z',
    },
    {
      id: 'cust_reg_1',
      atelierId: 'atelier_1',
      type: 'registered',
      registeredUserId: 'customer_1',
      name: 'Amina Bello',
      phone: '+234 803 123 4567',
      notes: 'Partage ses mesures en temps réel depuis son profil client.',
      measurements: { bust: 88, waist: 68, hips: 96, arm: 30 },
      createdAt: '2026-03-02T09:00:00Z',
    },
    {
      id: 'cust_reg_2',
      atelierId: 'atelier_2',
      type: 'registered',
      registeredUserId: 'customer_2',
      name: 'Mariama Sylla',
      phone: '+221 70 987 65 43',
      notes: 'Adore les motifs floraux de Wax hollandais.',
      measurements: { bust: 95, waist: 78, hips: 108, arm: 33 },
      createdAt: '2026-03-06T10:00:00Z',
    }
  ];

  const measureBooks: MeasureBook[] = [
    {
      customerUserId: 'customer_1',
      measurements: { bust: 88, waist: 68, hips: 96, arm: 30 },
      shares: ['atelier_1'],
      updatedAt: '2026-03-02T09:00:00Z',
    },
    {
      customerUserId: 'customer_2',
      measurements: { bust: 95, waist: 78, hips: 108, arm: 33 },
      shares: ['atelier_2', 'atelier_1'],
      updatedAt: '2026-03-06T10:00:00Z',
    }
  ];

  const posts: Post[] = [
    {
      id: 'post_1',
      authorId: 'seamstress_1',
      authorName: 'Fatoumata Diallo',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      atelierId: 'atelier_1',
      caption: "Robe Sirène Impériale Léopard & Bronze — Majestueuse création de haute couture avec corset perlé en strass d'or, épaulettes sculpturales drapées et traîne volumineuse en cascades d'imprimé léopard. Un chef-d'œuvre de prestige pour les grandes cérémonies.",
      priceHint: 150000,
      currency: 'XOF',
      tags: ['Haute Couture', 'Sirène', 'Léopard', 'Prestige', 'Chic'],
      media: ['/hero_couture_dress.jpg'],
      likeCount: 42,
      commentCount: 2,
      likes: ['customer_1', 'customer_2'],
      comments: [
        { id: 'c1', authorName: 'Amina Bello', authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', text: 'Ces couleurs sont incroyables, j\'adore la structure des épaules !', createdAt: '2026-07-15T10:00:00Z' },
        { id: 'c2', authorName: 'Mariama Sylla', authorAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150', text: 'Quel chef d\'œuvre ! Fatoumata, vous vous êtes surpassée.', createdAt: '2026-07-16T12:00:00Z' }
      ],
      createdAt: '2026-07-10T12:00:00Z',
    },
    {
      id: 'post_2',
      authorId: 'seamstress_2',
      authorName: 'Awa Koné',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      atelierId: 'atelier_2',
      caption: "Robe Sirène Impériale en Kente — Splendide robe de cérémonie en tissu Kente tissé main de fils d'or et de soie rose/orangée, avec une traîne royale spectaculaire. Une pièce maîtresse pour les célébrations de prestige.",
      priceHint: 120000,
      currency: 'XOF',
      tags: ['Kente', 'Traditionnel', 'Mariage', 'Prestige'],
      media: ['https://images.unsplash.com/photo-1561414927-6d86591d0c4f?w=800'],
      likeCount: 68,
      commentCount: 1,
      likes: ['customer_1'],
      comments: [
        { id: 'c3', authorName: 'Amina Bello', authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', text: 'Une robe digne d\'une reine pour un mariage d\'exception.', createdAt: '2026-07-12T16:00:00Z' }
      ],
      createdAt: '2026-07-11T15:30:00Z',
    },
    {
      id: 'post_3',
      authorId: 'seamstress_1',
      authorName: 'Fatoumata Diallo',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      atelierId: 'atelier_1',
      caption: "Robe Émeraude Royale — Majestueuse robe de bal bouffante en imprimé wax vert émeraude et jaune safran. Corset drapé en satin de soie d'une élégance digne d'une reine, idéale pour les grandes occasions.",
      priceHint: 85000,
      currency: 'XOF',
      tags: ['Wax', 'Royal', 'Chic', 'Traditionnel'],
      media: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
      likeCount: 55,
      commentCount: 0,
      likes: ['customer_2', 'seamstress_2'],
      comments: [],
      createdAt: '2026-07-12T09:00:00Z',
    },
    {
      id: 'post_4',
      authorId: 'seamstress_2',
      authorName: 'Awa Koné',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      atelierId: 'atelier_2',
      caption: "Robe de Prestige Écorce de Cannelle — Robe sirène transparente couleur cannelle ornée de dentelle perlée ivoire dessinant des ramages délicats sur le corps. Une véritable pièce d'art vestimentaire.",
      priceHint: 95000,
      currency: 'XOF',
      tags: ['HauteCouture', 'Prestige', 'Moderne', 'Chic'],
      media: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'],
      likeCount: 39,
      commentCount: 0,
      likes: [],
      comments: [],
      createdAt: '2026-07-13T10:00:00Z',
    },
    {
      id: 'post_5',
      authorId: 'seamstress_1',
      authorName: 'Fatoumata Diallo',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      atelierId: 'atelier_1',
      caption: "Fourreau Chocolat & Kente Brodé — Ensemble d'exception marron chocolat perlé de jais sur l'encolure bateau, et bas sirène drapé en motif kente traditionnel et pailleté.",
      priceHint: 65000,
      currency: 'XOF',
      tags: ['Kente', 'Chic', 'Traditionnel', 'Prestige'],
      media: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
      likeCount: 47,
      commentCount: 0,
      likes: [],
      comments: [],
      createdAt: '2026-07-14T11:00:00Z',
    },
    {
      id: 'post_6',
      authorId: 'seamstress_2',
      authorName: 'Awa Koné',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      atelierId: 'atelier_2',
      caption: "Robe Sirène Soleil de Bronze — Robe de soirée drapée en satin de soie marron bronze avec un corset sculpté rayonnant de fines broderies dorées en forme de soleil.",
      priceHint: 75000,
      currency: 'XOF',
      tags: ['HauteCouture', 'Moderne', 'Prestige'],
      media: ['https://images.unsplash.com/photo-1572495537021-a67b12938b8b?w=800'],
      likeCount: 51,
      commentCount: 0,
      likes: [],
      comments: [],
      createdAt: '2026-07-15T14:00:00Z',
    },
    {
      id: 'post_7',
      authorId: 'seamstress_1',
      authorName: 'Fatoumata Diallo',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      atelierId: 'atelier_1',
      caption: "Robe Cuivrée d'Apparat — Somptueuse robe de mariée sirène en dentelle de bronze rehaussée d'une double traîne amovible en satin de soie cuivré drapé à la main.",
      priceHint: 130000,
      currency: 'XOF',
      tags: ['Mariage', 'Prestige', 'HauteCouture'],
      media: ['https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=800'],
      likeCount: 72,
      commentCount: 0,
      likes: [],
      comments: [],
      createdAt: '2026-07-16T09:00:00Z',
    },
    {
      id: 'post_8',
      authorId: 'seamstress_2',
      authorName: 'Awa Koné',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      atelierId: 'atelier_2',
      caption: "Création Majesté Violette — Robe de cérémonie sirène en dentelle et velours dégradé de pourpre et violet, vendue avec son éventail assorti entièrement brodé main.",
      priceHint: 80000,
      currency: 'XOF',
      tags: ['Chic', 'Mariage', 'Prestige', 'Traditionnel'],
      media: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800'],
      likeCount: 63,
      commentCount: 0,
      likes: [],
      comments: [],
      createdAt: '2026-07-17T15:00:00Z',
    },
    {
      id: 'post_9',
      authorId: 'seamstress_1',
      authorName: 'Fatoumata Diallo',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      atelierId: 'atelier_1',
      caption: "Ensemble d'Apparat Couple Impérial — Tenues coordonnées pour couple : robe sirène drapée vert émeraude pour elle, et grand boubou agbada traditionnel assorti avec broderies géométriques or pour lui.",
      priceHint: 150000,
      currency: 'XOF',
      tags: ['Mariage', 'Traditionnel', 'Royal', 'Kente'],
      media: ['https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=800'],
      likeCount: 89,
      commentCount: 0,
      likes: [],
      comments: [],
      createdAt: '2026-07-18T10:00:00Z',
    },
    {
      id: 'post_10',
      authorId: 'seamstress_2',
      authorName: 'Awa Koné',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      atelierId: 'atelier_2',
      caption: "Robe de Mariée Reine d'Afrique — Robe de mariée sirène blanche éblouissante en dentelle de Calais entièrement perlée, avec une traîne cathédrale volantée d'une splendeur inoubliable.",
      priceHint: 250000,
      currency: 'XOF',
      tags: ['Mariage', 'HauteCouture', 'Prestige'],
      media: ['https://images.unsplash.com/photo-1590075865003-e48277fda558?w=800'],
      likeCount: 95,
      commentCount: 0,
      likes: [],
      comments: [],
      createdAt: '2026-07-18T16:00:00Z',
    },
    {
      id: 'post_11',
      authorId: 'seamstress_1',
      authorName: 'Fatoumata Diallo',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      atelierId: 'atelier_1',
      caption: "Robe Mandarine de Prestige — Chef-d'œuvre de haute couture orange mandarine entièrement brodé de perles et de sequins d'or, orné d'une fleur sculptée à l'épaule droite.",
      priceHint: 110000,
      currency: 'XOF',
      tags: ['HauteCouture', 'Prestige', 'Chic'],
      media: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800'],
      likeCount: 58,
      commentCount: 0,
      likes: [],
      comments: [],
      createdAt: '2026-07-19T09:00:00Z',
    },
    {
      id: 'post_12',
      authorId: 'seamstress_2',
      authorName: 'Awa Koné',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      atelierId: 'atelier_2',
      caption: "Robe Volumineuse Léopard Couture — Robe de bal spectaculaire à volants étagés volumineux imprimés léopard sauvage et broderies de perles brunes. Pour les femmes audacieuses.",
      priceHint: 140000,
      currency: 'XOF',
      tags: ['HauteCouture', 'Moderne', 'Chic'],
      media: ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800'],
      likeCount: 77,
      commentCount: 0,
      likes: [],
      comments: [],
      createdAt: '2026-07-19T14:30:00Z',
    }
  ];

  const orders: Order[] = [
    {
      id: 'order_1',
      atelierId: 'atelier_1',
      customerRefId: 'cust_reg_1',
      customerName: 'Amina Bello',
      customerPhone: '+234 803 123 4567',
      customerType: 'registered',
      modelPostId: 'post_1',
      modelCaption: 'Robe sirène Wax/Tulle ambré',
      status: 'SEWING',
      fabricReceived: true,
      dueDate: '2026-08-15',
      pricing: { total: 45000, deposit: 25000, balance: 20000, currency: 'XOF' },
      timestamps: { createdAt: '2026-07-01T10:00:00Z', updatedAt: '2026-07-15T11:00:00Z', deliveredAt: null },
      events: [
        { type: 'STATUS_CHANGED', byUserId: 'seamstress_1', text: 'Commande créée. Tissu validé.', createdAt: '2026-07-01T10:00:00Z' },
        { type: 'PAYMENT_ADDED', byUserId: 'seamstress_1', text: 'Acompte de 25 000 XOF enregistré.', createdAt: '2026-07-01T10:15:00Z' },
        { type: 'STATUS_CHANGED', byUserId: 'seamstress_1', text: 'Passage en cours de couture.', createdAt: '2026-07-15T11:00:00Z' }
      ]
    },
    {
      id: 'order_2',
      atelierId: 'atelier_1',
      customerRefId: 'cust_local_1',
      customerName: 'Ramata Ndiaye (Cliente Locale)',
      customerPhone: '+221 77 555 12 34',
      customerType: 'local',
      modelPostId: null,
      modelCaption: 'Ensemble Wax Jupe & Haut classique',
      status: 'FABRIC_RECEIVED',
      fabricReceived: true,
      dueDate: '2026-08-20',
      pricing: { total: 20000, deposit: 10000, balance: 10000, currency: 'XOF' },
      timestamps: { createdAt: '2026-07-10T14:00:00Z', updatedAt: '2026-07-10T14:00:00Z', deliveredAt: null },
      events: [
        { type: 'STATUS_CHANGED', byUserId: 'seamstress_1', text: 'Commande créée. Tissu déposé.', createdAt: '2026-07-10T14:00:00Z' },
        { type: 'PAYMENT_ADDED', byUserId: 'seamstress_1', text: 'Acompte de 10 000 XOF enregistré.', createdAt: '2026-07-10T14:10:00Z' }
      ]
    },
    {
      id: 'order_3',
      atelierId: 'atelier_1',
      customerRefId: 'cust_reg_1',
      customerName: 'Amina Bello',
      customerPhone: '+234 803 123 4567',
      customerType: 'registered',
      modelPostId: 'post_3',
      modelCaption: 'Grand Boubou Bazin brodé or',
      status: 'FITTING_READY',
      fabricReceived: true,
      dueDate: '2026-07-30',
      pricing: { total: 75000, deposit: 50000, balance: 25000, currency: 'XOF' },
      timestamps: { createdAt: '2026-06-20T10:00:00Z', updatedAt: '2026-07-18T16:00:00Z', deliveredAt: null },
      events: [
        { type: 'STATUS_CHANGED', byUserId: 'seamstress_1', text: 'Commande créée. Bazin haut de gamme livré.', createdAt: '2026-06-20T10:00:00Z' },
        { type: 'STATUS_CHANGED', byUserId: 'seamstress_1', text: 'Couture terminée. Prêt pour l\'essayage final.', createdAt: '2026-07-18T16:00:00Z' }
      ]
    },
    {
      id: 'order_4',
      atelierId: 'atelier_1',
      customerRefId: 'cust_reg_1',
      customerName: 'Amina Bello',
      customerPhone: '+234 803 123 4567',
      customerType: 'registered',
      modelPostId: null,
      modelCaption: 'Robe de demoiselle d\'honneur Wax',
      status: 'DELIVERED',
      fabricReceived: true,
      dueDate: '2026-07-15',
      pricing: { total: 18000, deposit: 18000, balance: 0, currency: 'XOF' },
      timestamps: { createdAt: '2026-06-15T09:00:00Z', updatedAt: '2026-07-14T17:00:00Z', deliveredAt: '2026-07-14T17:00:00Z' },
      events: [
        { type: 'STATUS_CHANGED', byUserId: 'seamstress_1', text: 'Livre de couture complété.', createdAt: '2026-06-15T09:00:00Z' },
        { type: 'STATUS_CHANGED', byUserId: 'seamstress_1', text: 'Vêtement livré avec succès. Solde entièrement payé.', createdAt: '2026-07-14T17:00:00Z' }
      ]
    }
  ];

  const conversations: Conversation[] = [
    {
      id: 'conv_1',
      members: ['customer_1', 'seamstress_1'],
      memberDetails: {
        'customer_1': { name: 'Amina Bello', photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', role: 'customer' },
        'seamstress_1': { name: 'Fatoumata Diallo', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', role: 'seamstress' }
      },
      atelierId: 'atelier_1',
      lastMessageAt: '2026-07-19T14:30:00Z',
      lastMessagePreview: 'Bonjour Amina, votre Robe sirène avance très bien ! Le buste est presque terminé.'
    }
  ];

  const messages: Message[] = [
    {
      id: 'm1',
      conversationId: 'conv_1',
      from: 'customer_1',
      type: 'text',
      text: 'Bonjour Madame Fatoumata, je souhaitais avoir des nouvelles de ma commande de robe sirène ?',
      createdAt: '2026-07-19T14:00:00Z',
    },
    {
      id: 'm2',
      conversationId: 'conv_1',
      from: 'seamstress_1',
      type: 'text',
      text: 'Bonjour Amina, votre Robe sirène avance très bien ! Le buste est presque terminé.',
      createdAt: '2026-07-19T14:30:00Z',
    }
  ];

  const tasks: Task[] = [
    { id: 'task_1', atelierId: 'atelier_1', title: 'Couper le bazin pour le boubou royal', completed: true, dueDate: '2026-07-18' },
    { id: 'task_2', atelierId: 'atelier_1', title: 'Ajuster les manches de la robe sirène d\'Amina', completed: false, dueDate: '2026-07-22' },
    { id: 'task_3', atelierId: 'atelier_1', title: 'Rendez-vous essayage final Amina (Boubou)', completed: false, dueDate: '2026-07-24' }
  ];

  const reports: Report[] = [];

  const initialDB: DB = {
    users,
    ateliers,
    customers,
    measureBooks,
    posts,
    orders,
    conversations,
    messages,
    tasks,
    reports,
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
  return initialDB;
}

// Global active in-memory state
const database = loadDB();

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf-8');
}

// Simulated active session variable
let currentUserSession: User = database.users[0]; // defaults to Fatoumata (seamstress)

// --- Auth Endpoints ---
app.post('/api/auth/register', (req, res) => {
  const { displayName, email, role, phone } = req.body;
  if (!displayName || !email || !role) {
    res.status(400).json({ error: 'Champs obligatoires manquants.' });
    return;
  }

  // Irreversible role logic
  if (database.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    res.status(400).json({ error: 'Un compte avec cette adresse email existe déjà.' });
    return;
  }

  const id = 'user_' + Math.random().toString(36).substr(2, 9);
  let atelierId = null;

  if (role === 'seamstress') {
    atelierId = 'atelier_' + Math.random().toString(36).substr(2, 9);
    // Create new atelier
    const newAtelier: Atelier = {
      id: atelierId,
      ownerId: id,
      name: `Maison de Couture ${displayName}`,
      location: { city: 'Dakar', country: 'Sénégal' },
      bio: 'Nouvel atelier de couture haute de gamme sur Harmy\'sewing.',
      pricing: 'Tarifs sur devis.',
      portfolioCoverURL: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      createdAt: new Date().toISOString(),
      rating: 5.0,
      reviews: []
    };
    database.ateliers.push(newAtelier);
  }

  const newUser: User = {
    id,
    displayName,
    email,
    role,
    photoURL: role === 'seamstress' ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: phone || '',
    whatsapp: phone ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}` : '',
    atelierId,
    subscription: { status: 'active', plan: 'Atelier Premium Trial', renewalDate: '2026-12-31' },
    createdAt: new Date().toISOString(),
  };

  database.users.push(newUser);

  // If customer, prefill an empty measurements notebook
  if (role === 'customer') {
    database.measureBooks.push({
      customerUserId: id,
      measurements: { bust: 0, waist: 0, hips: 0, arm: 0 },
      shares: [],
      updatedAt: new Date().toISOString()
    });
  }

  saveDB();
  currentUserSession = newUser;
  res.json(newUser);
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = database.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (user) {
    currentUserSession = user;
    res.json(user);
  } else {
    res.status(404).json({ error: 'Adresse email introuvable.' });
  }
});

app.get('/api/auth/current', (req, res) => {
  res.json(currentUserSession);
});

// Switch role endpoint (pure convenience for testing in the browser)
app.post('/api/auth/switch-user', (req, res) => {
  const { userId } = req.body;
  const user = database.users.find(u => u.id === userId);
  if (user) {
    currentUserSession = user;
    res.json(user);
  } else {
    res.status(404).json({ error: 'Utilisateur non trouvé.' });
  }
});

app.get('/api/users/list', (req, res) => {
  res.json(database.users);
});

// --- Posts Endpoints (Social Feed) ---
app.get('/api/posts', (req, res) => {
  const { tag } = req.query;
  let result = [...database.posts];

  if (tag) {
    const searchTag = String(tag).toLowerCase();
    result = result.filter(p => p.tags.some(t => t.toLowerCase().includes(searchTag)));
  }

  // Sort descending by date
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(result);
});

app.post('/api/posts', (req, res) => {
  const { caption, priceHint, tags, media } = req.body;
  if (currentUserSession.role !== 'seamstress') {
    res.status(403).json({ error: 'Action réservée aux couturières.' });
    return;
  }

  const newPost: Post = {
    id: 'post_' + Math.random().toString(36).substr(2, 9),
    authorId: currentUserSession.id,
    authorName: currentUserSession.displayName,
    authorAvatar: currentUserSession.photoURL,
    atelierId: currentUserSession.atelierId || '',
    caption: caption || '',
    priceHint: Number(priceHint) || 0,
    currency: 'XOF',
    tags: Array.isArray(tags) ? tags : [],
    media: Array.isArray(media) && media.length > 0 ? media : ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
    likeCount: 0,
    commentCount: 0,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };

  database.posts.push(newPost);
  saveDB();
  res.json(newPost);
});

app.post('/api/posts/:id/like', (req, res) => {
  const post = database.posts.find(p => p.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Publication introuvable.' });
    return;
  }

  const userId = currentUserSession.id;
  const idx = post.likes.indexOf(userId);
  if (idx > -1) {
    post.likes.splice(idx, 1);
  } else {
    post.likes.push(userId);
  }
  post.likeCount = post.likes.length;
  saveDB();
  res.json(post);
});

app.post('/api/posts/:id/comment', (req, res) => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ error: 'Texte du commentaire vide.' });
    return;
  }

  const post = database.posts.find(p => p.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Publication introuvable.' });
    return;
  }

  const newComment: Comment = {
    id: 'comm_' + Math.random().toString(36).substr(2, 9),
    authorName: currentUserSession.displayName,
    authorAvatar: currentUserSession.photoURL,
    text,
    createdAt: new Date().toISOString(),
  };

  post.comments.push(newComment);
  post.commentCount = post.comments.length;
  saveDB();
  res.json(post);
});

// --- Ateliers Endpoints ---
app.get('/api/ateliers', (req, res) => {
  res.json(database.ateliers);
});

app.get('/api/ateliers/:id', (req, res) => {
  const atelier = database.ateliers.find(a => a.id === req.params.id);
  if (atelier) {
    res.json(atelier);
  } else {
    res.status(404).json({ error: 'Atelier introuvable.' });
  }
});

app.put('/api/ateliers/:id', (req, res) => {
  const atelier = database.ateliers.find(a => a.id === req.params.id);
  if (!atelier) {
    res.status(404).json({ error: 'Atelier introuvable.' });
    return;
  }

  if (currentUserSession.role !== 'seamstress' || currentUserSession.atelierId !== atelier.id) {
    res.status(403).json({ error: 'Non autorisé.' });
    return;
  }

  const { name, bio, pricing, portfolioCoverURL, location } = req.body;
  if (name) atelier.name = name;
  if (bio) atelier.bio = bio;
  if (pricing) atelier.pricing = pricing;
  if (portfolioCoverURL) atelier.portfolioCoverURL = portfolioCoverURL;
  if (location) atelier.location = location;

  saveDB();
  res.json(atelier);
});

app.post('/api/ateliers/:id/reviews', (req, res) => {
  const atelier = database.ateliers.find(a => a.id === req.params.id);
  if (!atelier) {
    res.status(404).json({ error: 'Atelier introuvable.' });
    return;
  }

  const { rating, text } = req.body;
  if (!rating) {
    res.status(400).json({ error: 'Une note est requise.' });
    return;
  }

  atelier.reviews.push({
    authorName: currentUserSession.displayName,
    rating: Number(rating),
    text: text || '',
    createdAt: new Date().toISOString(),
  });

  // Recompute average rating
  const total = atelier.reviews.reduce((sum, r) => sum + r.rating, 0);
  atelier.rating = Number((total / atelier.reviews.length).toFixed(1));

  saveDB();
  res.json(atelier);
});

// --- Customers (Measurements Book) Endpoints ---
app.get('/api/customers', (req, res) => {
  if (currentUserSession.role !== 'seamstress' || !currentUserSession.atelierId) {
    res.status(403).json({ error: 'Action réservée aux ateliers actifs.' });
    return;
  }

  // Fetch all customers belonging to this atelier
  const list = database.customers.filter(c => c.atelierId === currentUserSession.atelierId);
  res.json(list);
});

app.post('/api/customers', (req, res) => {
  const { name, phone, notes, measurements, type, registeredUserId } = req.body;
  if (currentUserSession.role !== 'seamstress' || !currentUserSession.atelierId) {
    res.status(403).json({ error: 'Action réservée aux ateliers actifs.' });
    return;
  }

  if (!name || !phone) {
    res.status(400).json({ error: 'Le nom et le numéro de téléphone sont requis.' });
    return;
  }

  const newCust: CustomerAtelier = {
    id: 'cust_' + Math.random().toString(36).substr(2, 9),
    atelierId: currentUserSession.atelierId,
    type: type || 'local',
    registeredUserId: registeredUserId || null,
    name,
    phone,
    notes: notes || '',
    measurements: measurements || { bust: 0, waist: 0, hips: 0, arm: 0 },
    createdAt: new Date().toISOString(),
  };

  database.customers.push(newCust);
  saveDB();
  res.json(newCust);
});

app.put('/api/customers/:id', (req, res) => {
  const cust = database.customers.find(c => c.id === req.params.id);
  if (!cust) {
    res.status(404).json({ error: 'Cliente introuvable.' });
    return;
  }

  if (currentUserSession.role !== 'seamstress' || cust.atelierId !== currentUserSession.atelierId) {
    res.status(403).json({ error: 'Non autorisé.' });
    return;
  }

  const { name, phone, notes, measurements } = req.body;
  if (name) cust.name = name;
  if (phone) cust.phone = phone;
  if (notes !== undefined) cust.notes = notes;
  if (measurements) cust.measurements = measurements;

  saveDB();
  res.json(cust);
});

// --- Client Measurements Sharing ---
app.get('/api/measurements/my', (req, res) => {
  if (currentUserSession.role !== 'customer') {
    res.status(403).json({ error: 'Réservé aux clientes.' });
    return;
  }

  let book = database.measureBooks.find(b => b.customerUserId === currentUserSession.id);
  if (!book) {
    book = {
      customerUserId: currentUserSession.id,
      measurements: { bust: 0, waist: 0, hips: 0, arm: 0 },
      shares: [],
      updatedAt: new Date().toISOString()
    };
    database.measureBooks.push(book);
    saveDB();
  }
  res.json(book);
});

app.put('/api/measurements/my', (req, res) => {
  if (currentUserSession.role !== 'customer') {
    res.status(403).json({ error: 'Réservé aux clientes.' });
    return;
  }

  let book = database.measureBooks.find(b => b.customerUserId === currentUserSession.id);
  if (!book) {
    book = {
      customerUserId: currentUserSession.id,
      measurements: { bust: 0, waist: 0, hips: 0, arm: 0 },
      shares: [],
      updatedAt: new Date().toISOString()
    };
    database.measureBooks.push(book);
  }

  const { measurements } = req.body;
  if (measurements) {
    book.measurements = measurements;
    book.updatedAt = new Date().toISOString();
  }

  // Propagate updated measurements to any sharing ateliers' customers copies
  database.customers.forEach(c => {
    if (c.registeredUserId === currentUserSession.id) {
      c.measurements = { ...book.measurements };
    }
  });

  saveDB();
  res.json(book);
});

app.post('/api/measurements/my/shares', (req, res) => {
  if (currentUserSession.role !== 'customer') {
    res.status(403).json({ error: 'Réservé aux clientes.' });
    return;
  }

  const { atelierId, grant } = req.body;
  if (!atelierId) {
    res.status(400).json({ error: 'atelierId manquant.' });
    return;
  }

  let book = database.measureBooks.find(b => b.customerUserId === currentUserSession.id);
  if (!book) {
    book = {
      customerUserId: currentUserSession.id,
      measurements: { bust: 0, waist: 0, hips: 0, arm: 0 },
      shares: [],
      updatedAt: new Date().toISOString()
    };
    database.measureBooks.push(book);
  }

  const idx = book.shares.indexOf(atelierId);
  if (grant) {
    if (idx === -1) {
      book.shares.push(atelierId);
    }
    // Check if customer already exists in that atelier, otherwise sync register
    const exists = database.customers.some(c => c.atelierId === atelierId && c.registeredUserId === currentUserSession.id);
    if (!exists) {
      database.customers.push({
        id: 'cust_' + Math.random().toString(36).substr(2, 9),
        atelierId,
        type: 'registered',
        registeredUserId: currentUserSession.id,
        name: currentUserSession.displayName,
        phone: currentUserSession.phone,
        notes: 'Partagé via carnet de mesures numérique.',
        measurements: { ...book.measurements },
        createdAt: new Date().toISOString()
      });
    }
  } else {
    if (idx > -1) {
      book.shares.splice(idx, 1);
    }
    // Delete sharing reference from that atelier (or switch it back to local)
    database.customers = database.customers.filter(
      c => !(c.atelierId === atelierId && c.registeredUserId === currentUserSession.id)
    );
  }

  saveDB();
  res.json(book);
});

// --- Orders & Kanban Endpoints ---
app.get('/api/orders', (req, res) => {
  if (currentUserSession.role === 'seamstress') {
    const list = database.orders.filter(o => o.atelierId === currentUserSession.atelierId);
    res.json(list);
  } else if (currentUserSession.role === 'customer') {
    const list = database.orders.filter(o => o.customerPhone === currentUserSession.phone);
    res.json(list);
  } else {
    res.json(database.orders); // Admin sees everything
  }
});

app.post('/api/orders', (req, res) => {
  const { customerRefId, modelPostId, modelCaption, total, deposit, dueDate, fabricReceived } = req.body;
  if (currentUserSession.role !== 'seamstress' || !currentUserSession.atelierId) {
    res.status(403).json({ error: 'Seules les couturières peuvent créer des commandes.' });
    return;
  }

  const customer = database.customers.find(c => c.id === customerRefId);
  if (!customer) {
    res.status(400).json({ error: 'Cliente de l\'atelier introuvable.' });
    return;
  }

  const orderId = 'order_' + Math.random().toString(36).substr(2, 9);
  const totalVal = Number(total) || 0;
  const depositVal = Number(deposit) || 0;
  const balanceVal = Math.max(0, totalVal - depositVal);

  const newOrder: Order = {
    id: orderId,
    atelierId: currentUserSession.atelierId,
    customerRefId,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerType: customer.type,
    modelPostId: modelPostId || null,
    modelCaption: modelCaption || 'Création personnalisée',
    status: 'FABRIC_RECEIVED',
    fabricReceived: fabricReceived === undefined ? true : !!fabricReceived,
    dueDate: dueDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    pricing: {
      total: totalVal,
      deposit: depositVal,
      balance: balanceVal,
      currency: 'XOF',
    },
    timestamps: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveredAt: null,
    },
    events: [
      { type: 'STATUS_CHANGED', byUserId: currentUserSession.id, text: 'Commande initiée. Tissu reçu.', createdAt: new Date().toISOString() },
      { type: 'PAYMENT_ADDED', byUserId: currentUserSession.id, text: `Acompte initial de ${depositVal} XOF perçu.`, createdAt: new Date().toISOString() }
    ]
  };

  database.orders.push(newOrder);
  saveDB();
  res.json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const order = database.orders.find(o => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Commande introuvable.' });
    return;
  }

  if (currentUserSession.role !== 'seamstress' || order.atelierId !== currentUserSession.atelierId) {
    res.status(403).json({ error: 'Non autorisé.' });
    return;
  }

  const { status } = req.body;
  const validStatuses = ['FABRIC_RECEIVED', 'SEWING', 'FITTING_READY', 'DELIVERED', 'ARCHIVED'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Statut de commande invalide.' });
    return;
  }

  const oldStatus = order.status;
  order.status = status as Order['status'];
  order.timestamps.updatedAt = new Date().toISOString();

  let eventText = `Statut modifié de ${oldStatus} à ${status}.`;
  if (status === 'DELIVERED') {
    order.timestamps.deliveredAt = new Date().toISOString();
    // Auto-complete balance if appropriate, or lock it
    eventText = "Commande livrée à la cliente. Couture finalisée.";
  }

  order.events.push({
    type: 'STATUS_CHANGED',
    byUserId: currentUserSession.id,
    text: eventText,
    createdAt: new Date().toISOString(),
  });

  saveDB();
  res.json(order);
});

app.put('/api/orders/:id/payment', (req, res) => {
  const order = database.orders.find(o => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Commande introuvable.' });
    return;
  }

  if (currentUserSession.role !== 'seamstress' || order.atelierId !== currentUserSession.atelierId) {
    res.status(403).json({ error: 'Non autorisé.' });
    return;
  }

  const { amount } = req.body;
  const payAmt = Number(amount) || 0;
  if (payAmt <= 0) {
    res.status(400).json({ error: 'Le montant de paiement doit être supérieur à zéro.' });
    return;
  }

  order.pricing.deposit += payAmt;
  order.pricing.balance = Math.max(0, order.pricing.total - order.pricing.deposit);
  order.timestamps.updatedAt = new Date().toISOString();

  order.events.push({
    type: 'PAYMENT_ADDED',
    byUserId: currentUserSession.id,
    text: `Nouveau paiement de ${payAmt} XOF enregistré. Reste à payer: ${order.pricing.balance} XOF.`,
    createdAt: new Date().toISOString(),
  });

  saveDB();
  res.json(order);
});

app.delete('/api/orders/:id', (req, res) => {
  const idx = database.orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Commande introuvable.' });
    return;
  }

  const order = database.orders[idx];
  if (currentUserSession.role !== 'seamstress' || order.atelierId !== currentUserSession.atelierId) {
    res.status(403).json({ error: 'Non autorisé.' });
    return;
  }

  database.orders.splice(idx, 1);
  saveDB();
  res.json({ success: true });
});

// --- Chat Messaging Endpoints ---
app.get('/api/conversations', (req, res) => {
  const uid = currentUserSession.id;
  const list = database.conversations.filter(c => c.members.includes(uid));
  res.json(list);
});

app.post('/api/conversations', (req, res) => {
  const { otherUserId, atelierId } = req.body;
  if (!otherUserId) {
    res.status(400).json({ error: 'otherUserId requis.' });
    return;
  }

  const myId = currentUserSession.id;
  const existing = database.conversations.find(
    c => c.members.includes(myId) && c.members.includes(otherUserId)
  );

  if (existing) {
    res.json(existing);
    return;
  }

  const otherUser = database.users.find(u => u.id === otherUserId);
  if (!otherUser) {
    res.status(404).json({ error: 'Utilisateur de destination introuvable.' });
    return;
  }

  const convId = 'conv_' + Math.random().toString(36).substr(2, 9);
  const newConv: Conversation = {
    id: convId,
    members: [myId, otherUserId],
    memberDetails: {
      [myId]: { name: currentUserSession.displayName, photoURL: currentUserSession.photoURL, role: currentUserSession.role },
      [otherUserId]: { name: otherUser.displayName, photoURL: otherUser.photoURL, role: otherUser.role }
    },
    atelierId: atelierId || currentUserSession.atelierId || '',
    lastMessageAt: new Date().toISOString(),
    lastMessagePreview: 'Conversation initiée.'
  };

  database.conversations.push(newConv);
  saveDB();
  res.json(newConv);
});

app.get('/api/conversations/:id/messages', (req, res) => {
  const list = database.messages.filter(m => m.conversationId === req.params.id);
  // Sort chronological
  list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  res.json(list);
});

app.post('/api/conversations/:id/messages', (req, res) => {
  const { text } = req.body;
  const convId = req.params.id;
  const conversation = database.conversations.find(c => c.id === convId);

  if (!conversation) {
    res.status(404).json({ error: 'Conversation introuvable.' });
    return;
  }

  const newMsg: Message = {
    id: 'msg_' + Math.random().toString(36).substr(2, 9),
    conversationId: convId,
    from: currentUserSession.id,
    type: 'text',
    text: text || '',
    createdAt: new Date().toISOString()
  };

  database.messages.push(newMsg);
  conversation.lastMessageAt = newMsg.createdAt;
  conversation.lastMessagePreview = text;

  saveDB();

  // Simulated automatic reply from the other user for a highly interactive and alive demo!
  const otherUserId = conversation.members.find(m => m !== currentUserSession.id);
  if (otherUserId) {
    const otherUser = database.users.find(u => u.id === otherUserId);
    setTimeout(() => {
      let replyText = "Merci pour votre message ! Je regarde cela tout de suite.";
      if (otherUser?.role === 'seamstress') {
        replyText = `Bonjour ${currentUserSession.displayName}, merci d'avoir contacté mon atelier. Je prends connaissance de votre demande et je vous réponds dès la fin de ma coupe en cours !`;
      } else {
        replyText = `Bonjour ! Merci beaucoup pour les détails, vos créations sont magnifiques. Pouvons-nous programmer un rendez-vous d'essayage bientôt ?`;
      }

      const botMsg: Message = {
        id: 'msg_' + Math.random().toString(36).substr(2, 9),
        conversationId: convId,
        from: otherUserId,
        type: 'text',
        text: replyText,
        createdAt: new Date().toISOString()
      };
      database.messages.push(botMsg);
      conversation.lastMessageAt = botMsg.createdAt;
      conversation.lastMessagePreview = replyText;
      saveDB();
    }, 1500);
  }

  res.json(newMsg);
});

// --- Finance Endpoints ---
app.get('/api/finance/summary', (req, res) => {
  if (currentUserSession.role !== 'seamstress' || !currentUserSession.atelierId) {
    res.status(403).json({ error: 'Réservé aux ateliers.' });
    return;
  }

  const atelierId = currentUserSession.atelierId;
  const myOrders = database.orders.filter(o => o.atelierId === atelierId);

  let totalRevenue = 0; // sum of total of delivered/archived + deposits of active
  let totalDeposits = 0; // sum of actual deposits received
  let totalBalancesDue = 0; // sum of balance for active orders

  myOrders.forEach(o => {
    totalDeposits += o.pricing.deposit;
    if (o.status === 'DELIVERED' || o.status === 'ARCHIVED') {
      totalRevenue += o.pricing.total;
    } else {
      totalRevenue += o.pricing.deposit; // revenue count so far
      totalBalancesDue += o.pricing.balance;
    }
  });

  res.json({
    currency: 'XOF',
    totalRevenue,
    totalDeposits,
    totalBalancesDue,
    orderCount: myOrders.length,
    activeOrderCount: myOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'ARCHIVED').length
  });
});

// --- Tasks Endpoints ---
app.get('/api/tasks', (req, res) => {
  if (!currentUserSession.atelierId) {
    res.json([]);
    return;
  }
  const list = database.tasks.filter(t => t.atelierId === currentUserSession.atelierId);
  res.json(list);
});

app.post('/api/tasks', (req, res) => {
  const { title, dueDate } = req.body;
  if (!currentUserSession.atelierId) {
    res.status(403).json({ error: 'Action réservée aux couturières.' });
    return;
  }

  const newTask: Task = {
    id: 'task_' + Math.random().toString(36).substr(2, 9),
    atelierId: currentUserSession.atelierId,
    title: title || 'Nouvelle tâche de couture',
    completed: false,
    dueDate: dueDate || new Date().toISOString().split('T')[0]
  };

  database.tasks.push(newTask);
  saveDB();
  res.json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const task = database.tasks.find(t => t.id === req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Tâche introuvable.' });
    return;
  }

  task.completed = !task.completed;
  saveDB();
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  database.tasks = database.tasks.filter(t => t.id !== req.params.id);
  saveDB();
  res.json({ success: true });
});

// --- Admin Endpoints ---
app.get('/api/admin/reports', (req, res) => {
  if (currentUserSession.role !== 'admin') {
    res.status(403).json({ error: 'Action réservée à l\'administration.' });
    return;
  }
  res.json(database.reports);
});

app.post('/api/admin/reports', (req, res) => {
  const { postId, reason } = req.body;
  const post = database.posts.find(p => p.id === postId);
  if (!post) {
    res.status(404).json({ error: 'Publication introuvable.' });
    return;
  }

  const newReport: Report = {
    id: 'rep_' + Math.random().toString(36).substr(2, 9),
    postId,
    postTitle: post.caption.substring(0, 30) + '...',
    reason: reason || 'Contenu inapproprié',
    reportedBy: currentUserSession.displayName,
    createdAt: new Date().toISOString()
  };

  database.reports.push(newReport);
  saveDB();
  res.json(newReport);
});

app.delete('/api/admin/posts/:id', (req, res) => {
  if (currentUserSession.role !== 'admin') {
    res.status(403).json({ error: 'Réservé aux administrateurs.' });
    return;
  }

  database.posts = database.posts.filter(p => p.id !== req.params.id);
  database.reports = database.reports.filter(r => r.postId !== req.params.id);
  saveDB();
  res.json({ success: true });
});

app.put('/api/admin/ateliers/:id/subscription', (req, res) => {
  if (currentUserSession.role !== 'admin') {
    res.status(403).json({ error: 'Réservé aux administrateurs.' });
    return;
  }

  const atelier = database.ateliers.find(a => a.id === req.params.id);
  if (!atelier) {
    res.status(404).json({ error: 'Atelier introuvable.' });
    return;
  }

  const owner = database.users.find(u => u.id === atelier.ownerId);
  if (owner) {
    owner.subscription.status = owner.subscription.status === 'active' ? 'inactive' : 'active';
  }

  saveDB();
  res.json({ success: true, owner });
});


/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response: unknown) =>
      response ? writeResponseToNodeResponse(response as Response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
