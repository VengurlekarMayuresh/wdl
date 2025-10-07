import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Apple, Dumbbell, Brain, Moon, Droplets, Search, Clock, User, BookOpen, Star, TrendingUp, Calendar, Share2, Play, ChefHat, Activity, Zap, Shield, Sparkles, Target, Award, ThumbsUp, MessageSquare, Download, Filter, ChevronRight, Lightbulb, Users, Globe, X } from 'lucide-react';
import { contentAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';

const iconMap = {
  Heart, Apple, Dumbbell, Brain, Moon, Droplets, ChefHat, Activity, Zap, Shield, Sparkles, Target
};

// High-quality static health content for open access
const staticHealthCategories = [
  { name: 'Nutrition', count: 45, color: 'bg-green-500', icon: Apple },
  { name: 'Fitness', count: 38, color: 'bg-blue-500', icon: Dumbbell },
  { name: 'Mental Health', count: 29, color: 'bg-purple-500', icon: Brain },
  { name: 'Hydration', count: 18, color: 'bg-cyan-500', icon: Droplets },
  { name: 'Wellness', count: 35, color: 'bg-pink-500', icon: Heart },
];

const staticHealthArticles = [
  {
    id: 1,
    title: '10 Evidence-Based Benefits of Daily Walking',
    excerpt: 'Discover how a simple 30-minute walk can transform your physical and mental health, backed by scientific research.',
    category: 'Fitness',
    author: 'Dr. Sarah Johnson',
    readTime: '7 min read',
    views: 12547,
    rating: 4.9,
    publishDate: '2024-01-15',
    featured: true,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 2,
    title: 'Mediterranean Diet: Complete Beginner\'s Guide',
    excerpt: 'Learn about one of the world\'s healthiest eating patterns and how to incorporate it into your daily routine.',
    category: 'Nutrition',
    author: 'Maria Rodriguez, RD',
    readTime: '12 min read',
    views: 18953,
    rating: 4.8,
    publishDate: '2024-01-10',
    featured: true,
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 3,
    title: 'Mindfulness Meditation for Stress Relief',
    excerpt: 'Reduce stress and anxiety with simple mindfulness techniques you can practice anywhere, anytime.',
    category: 'Mental Health',
    author: 'Lisa Thompson, LMFT',
    readTime: '8 min read',
    views: 15432,
    rating: 4.9,
    publishDate: '2024-01-05',
    featured: true,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 4,
    title: 'Hydration: How Much Water Do You Really Need?',
    excerpt: 'Debunking hydration myths and providing evidence-based recommendations for optimal fluid intake.',
    category: 'Hydration',
    author: 'Dr. Amanda Foster',
    readTime: '6 min read',
    views: 8765,
    rating: 4.6,
    publishDate: '2024-01-03',
    featured: true,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 5,
    title: 'Building Healthy Habits That Actually Stick',
    excerpt: 'Psychology-backed strategies for creating lasting positive changes in your daily routine.',
    category: 'Wellness',
    author: 'Dr. James Wilson',
    readTime: '10 min read',
    views: 11234,
    rating: 4.8,
    publishDate: '2024-01-01',
    featured: true,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  }
];

const staticHealthTips = [
  { 
    id: 1, 
    title: 'Stay Hydrated', 
    description: 'Drink 8-10 glasses of water daily to maintain optimal body function and energy levels.',
    icon: 'Droplets',
    category: 'hydration'
  },
  { 
    id: 2, 
    title: 'Move Every Hour', 
    description: 'Take a 5-minute walking break every hour to improve circulation and reduce stiffness.',
    icon: 'Activity',
    category: 'fitness'
  },
  { 
    id: 3, 
    title: 'Practice Deep Breathing', 
    description: 'Take 5 deep breaths when stressed to activate your body\'s relaxation response.',
    icon: 'Brain',
    category: 'mental-health'
  },
  { 
    id: 4, 
    title: 'Eat Colorful Foods', 
    description: 'Include fruits and vegetables of different colors to ensure diverse nutrient intake.',
    icon: 'Apple',
    category: 'nutrition'
  },
  { 
    id: 6, 
    title: 'Practice Gratitude', 
    description: 'Write down 3 things you\'re grateful for each day to improve mental wellbeing.',
    icon: 'Heart',
    category: 'wellness'
  },
  { 
    id: 7, 
    title: 'Limit Screen Time', 
    description: 'Take regular breaks from screens to reduce eye strain and improve focus.',
    icon: 'Shield',
    category: 'wellness'
  },
  { 
    id: 8, 
    title: 'Stretch Daily', 
    description: 'Incorporate 10-15 minutes of stretching to improve flexibility and reduce tension.',
    icon: 'Target',
    category: 'fitness'
  }
];

const staticHealthyRecipes = [
  {
    id: 1,
    name: 'Mediterranean Quinoa Bowl',
    category: 'Lunch',
    prepTime: '25 min',
    calories: 420,
    difficulty: 'Easy',
    description: 'Nutrient-packed bowl with quinoa, vegetables, and olive oil dressing',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    name: 'Green Smoothie Power Bowl',
    category: 'Breakfast',
    prepTime: '10 min',
    calories: 280,
    difficulty: 'Easy',
    description: 'Spinach, banana, and protein powder blend topped with fresh berries',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 3,
    name: 'Baked Salmon with Herbs',
    category: 'Dinner',
    prepTime: '30 min',
    calories: 350,
    difficulty: 'Medium',
    description: 'Omega-3 rich salmon with fresh herbs and roasted vegetables',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 4,
    name: 'Overnight Oats with Berries',
    category: 'Breakfast',
    prepTime: '5 min',
    calories: 320,
    difficulty: 'Easy',
    description: 'Fiber-rich oats soaked overnight with antioxidant-packed berries',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 5,
    name: 'Chickpea Buddha Bowl',
    category: 'Lunch',
    prepTime: '20 min',
    calories: 380,
    difficulty: 'Easy',
    description: 'Plant-based protein bowl with roasted chickpeas and tahini dressing',
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  }
];

const staticWorkoutPlans = [
  {
    id: 1,
    name: '15-Minute Morning Energizer',
    category: 'Cardio',
    duration: '15 min',
    level: 'Beginner',
    exercises: '8 exercises',
    description: 'Start your day with energy-boosting movements',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    name: 'Full Body Strength Training',
    category: 'Strength',
    duration: '45 min',
    level: 'Intermediate',
    exercises: '12 exercises',
    description: 'Complete strength workout targeting all major muscle groups',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 3,
    name: 'Yoga Flow for Flexibility',
    category: 'Flexibility',
    duration: '30 min',
    level: 'All Levels',
    exercises: '10 poses',
    description: 'Gentle yoga sequence to improve flexibility and reduce stress',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 4,
    name: 'HIIT Fat Burner',
    category: 'HIIT',
    duration: '20 min',
    level: 'Advanced',
    exercises: '6 circuits',
    description: 'High-intensity interval training for maximum calorie burn',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 5,
    name: 'Core Strengthening',
    category: 'Core',
    duration: '25 min',
    level: 'Intermediate',
    exercises: '9 exercises',
    description: 'Targeted core workout for improved stability and posture',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  }
];

const HealthyLivingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTipType, setSelectedTipType] = useState('all');

  // Dynamic data
  const [categories, setCategories] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [quickTips, setQuickTips] = useState([]);
  const [healthyRecipes, setHealthyRecipes] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Load static high-quality health content since API might not be available
  useEffect(() => {
    const loadStaticContent = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          const [cats, articles, tips, recipes, workouts] = await Promise.all([
            contentAPI.getCategories().catch(() => null),
            contentAPI.getFeaturedArticles({ featured: 'true', limit: 6 }).catch(() => null),
            contentAPI.getTips().catch(() => null),
            contentAPI.getRecipes().catch(() => null),
            contentAPI.getWorkouts().catch(() => null),
          ]);

          if (cats || articles || tips || recipes || workouts) {
            // API data available, use it
            const normalizedCats = (cats || []).map((c) => ({
              name: c.name || c.title || 'Category',
              count: c.count ?? c.itemsCount ?? 0,
              color: c.color || 'bg-primary',
              icon: iconMap[c.icon] || Heart,
            }));

            setCategories(normalizedCats);
            setFeaturedArticles(Array.isArray(articles) ? articles : []);
            setQuickTips(Array.isArray(tips) ? tips : []);
            setHealthyRecipes(Array.isArray(recipes) ? recipes : []);
            setWorkoutPlans(Array.isArray(workouts) ? workouts : []);
            return;
          }
        } catch (apiError) {
          console.log('API not available, using static content');
        }

        // Fallback to high-quality static content
        setCategories(staticHealthCategories);
        setFeaturedArticles(staticHealthArticles);
        setQuickTips(staticHealthTips);
        setHealthyRecipes(staticHealthyRecipes);
        setWorkoutPlans(staticWorkoutPlans);
        
      } catch (e) {
        setError(e.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadStaticContent();
  }, []);

  // Filter functions
  const filteredArticles = useMemo(() => {
    let articles = featuredArticles;
    
    // Filter by category
    if (activeCategory !== 'all') {
      articles = articles.filter(article => 
        article.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      articles = articles.filter((a) =>
        (a.title || '').toLowerCase().includes(q) || 
        (a.excerpt || '').toLowerCase().includes(q) ||
        (a.category || '').toLowerCase().includes(q)
      );
    }
    
    return articles;
  }, [featuredArticles, searchTerm, activeCategory]);
  
  const filteredTips = useMemo(() => {
    let tips = quickTips;
    
    if (selectedTipType !== 'all') {
      tips = tips.filter(tip => tip.category === selectedTipType);
    }
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      tips = tips.filter(tip => 
        tip.title.toLowerCase().includes(q) ||
        tip.description.toLowerCase().includes(q)
      );
    }
    
    return tips;
  }, [quickTips, selectedTipType, searchTerm]);
  
  // Newsletter subscription handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      // In a real app, this would send to backend
      toast.success(`Thank you! You've subscribed with ${newsletterEmail}`);
      setNewsletterEmail('');
    }
  };
  
  const getUserInitial = () => {
    if (isAuthenticated && user) {
      return (user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase();
    }
    return 'G'; // Guest
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-lg font-medium">Loading healthy living content...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>
  );

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header 
        isAuthenticated={isAuthenticated}
        userInitial={getUserInitial()}
        userType={user?.userType || 'guest'}
        onLogout={logout}
        showSearch={true}
      />

      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 animate-fadeInUp">
              Healthy Living <span className="text-primary-glow">Secrets</span>
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto animate-fadeInUp">
              Discover expert advice, proven tips, and personalized guidance to help you live your healthiest life.
            </p>
          </div>

          <div className="max-w-2xl mx-auto animate-fadeInUp">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                type="text"
                placeholder="Search health tips, recipes, workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/10 border-white/30 text-white placeholder:text-white/70 h-12"
              />
              <Button variant="hero" className="absolute right-2 top-1/2 -translate-y-1/2 h-8">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Explore Health Topics</h2>
            <p className="text-muted-foreground text-lg">Find expert guidance on the health areas that matter most to you</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {/* All Categories Button */}
            <Card 
              className={`border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer group ${
                activeCategory === 'all' ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => setActiveCategory('all')}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">All Topics</h3>
                <p className="text-xs text-muted-foreground">{featuredArticles.length} articles</p>
              </CardContent>
            </Card>
            
            {categories.map((category, index) => {
              const Icon = category.icon || Heart;
              const isActive = activeCategory === category.name.toLowerCase();
              return (
                <Card 
                  key={index} 
                  className={`border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer group ${
                    isActive ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setActiveCategory(category.name.toLowerCase())}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 ${
                      isActive ? 'scale-110' : ''
                    }`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`font-semibold text-sm text-foreground mb-1 ${isActive ? 'text-primary' : ''}`}>{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count ?? 0} articles</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Active Category Indicator */}
          {activeCategory !== 'all' && (
            <div className="text-center mb-6">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Filter className="h-3 w-3 mr-2" />
                Showing {activeCategory} articles
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-5 w-5 p-0"
                  onClick={() => setActiveCategory('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
          )}
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Featured Health Articles</h2>
              <p className="text-muted-foreground">Latest insights from our medical experts</p>
            </div>
            <Button variant="outline">View All Articles</Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Card 
                key={article.id || article._id} 
                className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/blog/${article.id}`)}
              >
                <div className="h-48 relative overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url(${article.image || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-white text-primary shadow-md">{article.category || 'General'}</Badge>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-3 w-3" />
                      <span>{(article.views || 0).toLocaleString()} views</span>
                      <Star className="h-3 w-3 ml-auto fill-current text-yellow-400" />
                      <span>{article.rating ?? '4.8'}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{article.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.excerpt || article.summary}</p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{article.author || 'Editorial Team'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime || '5 min read'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{article.publishDate ? new Date(article.publishDate).toLocaleDateString() : ''}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Share2 className="h-4 w-4" /></Button>
                      <Button 
                        variant="medical" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/blog/${article.id}`);
                        }}
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Read Article
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Daily Wellness Tips</h2>
            <p className="text-muted-foreground text-lg">Simple habits that make a big difference in your health</p>
          </div>
          
          {/* Tips Filter Tabs */}
          <Tabs value={selectedTipType} onValueChange={setSelectedTipType} className="mb-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="all" className="text-xs">All Tips</TabsTrigger>
              <TabsTrigger value="nutrition" className="text-xs">Nutrition</TabsTrigger>
              <TabsTrigger value="fitness" className="text-xs">Fitness</TabsTrigger>
              <TabsTrigger value="mental-health" className="text-xs">Mental</TabsTrigger>
              <TabsTrigger value="hydration" className="text-xs">Hydration</TabsTrigger>
              <TabsTrigger value="wellness" className="text-xs">Wellness</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTips.map((tip, index) => {
              const Icon = iconMap[tip.icon] || Droplets;
              return (
                <Card key={tip.id || index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 text-center group hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{tip.title || tip.tip}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
                    <div className="mt-4">
                      <Badge variant="outline" className="text-xs capitalize">
                        {tip.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredTips.length === 0 && (
            <div className="text-center py-12">
              <Lightbulb className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No tips found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Recipes & Workouts */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Healthy Recipes */}
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">Healthy Recipes</h2>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="space-y-4">
                {healthyRecipes.map((recipe) => (
                  <Card key={recipe.id || recipe._id} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 relative overflow-hidden rounded-l-lg flex-shrink-0">
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundImage: `url(${recipe.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <CardContent className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{recipe.name || recipe.title}</h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <ChefHat className="h-3 w-3 mr-1" />
                            {recipe.category || recipe.type || 'Recipe'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{recipe.prepTime || recipe.duration || '—'}</span></div>
                          <div className="flex items-center gap-1"><Zap className="h-3 w-3" /><span>{recipe.calories ? `${recipe.calories} cal` : 'N/A'}</span></div>
                          <div className="flex items-center gap-1"><Target className="h-3 w-3" /><span>{recipe.difficulty || 'Easy'}</span></div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Workout Plans */}
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">Workout Plans</h2>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="space-y-4">
                {workoutPlans.map((workout) => (
                  <Card key={workout.id || workout._id} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 relative overflow-hidden rounded-l-lg flex-shrink-0">
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundImage: `url(${workout.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                      <CardContent className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{workout.name || workout.title}</h3>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Activity className="h-3 w-3 mr-1" />
                            {workout.category || workout.type || 'Workout'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{workout.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{workout.duration || '—'}</span></div>
                          <div className="flex items-center gap-1"><Target className="h-3 w-3" /><span>{workout.level || 'Beginner'}</span></div>
                          <div className="flex items-center gap-1"><Dumbbell className="h-3 w-3" /><span>{workout.exercises || 'Various'}</span></div>
                        </div>
                        <Button variant="medical" size="sm" className="w-full group-hover:bg-primary/90 transition-colors">
                          <Play className="h-3 w-3 mr-1" />
                          Start Workout
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Content for Authenticated Users */}
      {isAuthenticated && (
        <section className="py-16 bg-accent/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Welcome back, {user?.firstName || 'Health Enthusiast'}! 👋
              </h2>
              <p className="text-muted-foreground text-lg">
                Here's your personalized wellness dashboard
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Health Progress */}
              <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Health Progress</h3>
                  <p className="text-muted-foreground text-sm mb-4">Track your wellness journey</p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Progress
                  </Button>
                </CardContent>
              </Card>
              
              {/* Saved Articles */}
              <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Saved Articles</h3>
                  <p className="text-muted-foreground text-sm mb-4">Your reading list</p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Saved
                  </Button>
                </CardContent>
              </Card>
              
              {/* Personal Goals */}
              <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Health Goals</h3>
                  <p className="text-muted-foreground text-sm mb-4">Set and track your goals</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Goals
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Recommended for You */}
            <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Recommended for You</h3>
                <p className="text-muted-foreground">Based on your interests and health profile</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArticles.slice(0, 3).map((article) => (
                  <Card 
                    key={article.id} 
                    className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                    onClick={() => navigate(`/blog/${article.id}`)}
                  >
                    <div className="h-32 relative overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url(${article.image || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <Badge className="absolute top-2 left-2 bg-primary/10 text-primary border-primary/20 backdrop-blur-sm">
                        {article.category}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">{article.rating}</span>
                        </div>
                        <div className="flex items-center text-primary text-sm group-hover:text-primary/80">
                          <span>Read More</span>
                          <ChevronRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-dark/20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="mb-8">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-white/80" />
            <h2 className="text-3xl font-bold mb-4">Stay Updated with Health Tips</h2>
            <p className="text-xl mb-2 opacity-90">Get weekly health insights, recipes, and wellness tips delivered to your inbox.</p>
            <p className="text-sm opacity-75">Join over 50,000+ health enthusiasts worldwide</p>
          </div>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/70 flex-1 h-12"
                required
              />
              <Button 
                type="submit" 
                variant="hero" 
                className="sm:w-auto h-12 px-8 bg-white text-primary hover:bg-white/90 font-semibold"
                disabled={!newsletterEmail.trim()}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Subscribe Free
              </Button>
            </div>
          </form>
          
          <div className="mt-6 flex items-center justify-center gap-6 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>No spam, ever</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Join 50K+ readers</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Expert content</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthyLivingPage;
