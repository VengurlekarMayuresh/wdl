import React, { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Heart, Apple, Dumbbell, Brain, Moon, Droplets, Search, Clock, User, BookOpen, Star, TrendingUp, Calendar, Share2, Play } from 'lucide-react';
import { contentAPI } from '@/services/api';

const iconMap = {
  Heart, Apple, Dumbbell, Brain, Moon, Droplets,
};

const HealthyLivingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic data
  const [categories, setCategories] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [quickTips, setQuickTips] = useState([]);
  const [healthyRecipes, setHealthyRecipes] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Fetch all in parallel
        const [cats, articles, tips, recipes, workouts] = await Promise.all([
          contentAPI.getCategories().catch(() => []),
          contentAPI.getFeaturedArticles({ featured: 'true', limit: 6 }).catch(() => []),
          contentAPI.getTips().catch(() => []),
          contentAPI.getRecipes().catch(() => []),
          contentAPI.getWorkouts().catch(() => []),
        ]);

        // Normalize categories (name, count, color, icon)
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
      } catch (e) {
        setError(e.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredArticles = useMemo(() => {
    if (!searchTerm) return featuredArticles;
    const q = searchTerm.toLowerCase();
    return featuredArticles.filter((a) =>
      (a.title || '').toLowerCase().includes(q) || (a.excerpt || '').toLowerCase().includes(q)
    );
  }, [featuredArticles, searchTerm]);

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
      <Header />

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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon || Heart;
              return (
                <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count ?? 0} articles</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
              <Card key={article.id || article._id} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary-light/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-white text-primary">{article.category || 'General'}</Badge>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-3 w-3" />
                      <span>{(article.views || 0).toLocaleString()} views</span>
                      <Star className="h-3 w-3 ml-auto" />
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
                      <Button variant="medical" size="sm"><BookOpen className="h-4 w-4 mr-1" />Read</Button>
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Daily Wellness Tips</h2>
            <p className="text-muted-foreground text-lg">Simple habits that make a big difference in your health</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickTips.map((tip, index) => {
              const Icon = iconMap[tip.icon] || Droplets;
              return (
                <Card key={tip.id || index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 text-center group">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{tip.title || tip.tip}</h3>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
                  <Card key={recipe.id || recipe._id} className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground">{recipe.name || recipe.title}</h3>
                        <Badge variant="secondary">{recipe.category || recipe.type || 'Recipe'}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{recipe.prepTime || recipe.duration || '—'}</span></div>
                        <div>{recipe.calories ? `${recipe.calories} cal` : ''}</div>
                        <div>{recipe.difficulty || ''}</div>
                      </div>
                    </CardContent>
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
                  <Card key={workout.id || workout._id} className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground">{workout.name || workout.title}</h3>
                        <Badge variant="secondary">{workout.category || workout.type || 'Workout'}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{workout.duration || '—'}</span></div>
                        <div>{workout.level || ''}</div>
                        <div>{workout.exercises ? `${workout.exercises} exercises` : ''}</div>
                      </div>
                      <Button variant="medical" size="sm" className="w-full"><Play className="h-3 w-3 mr-1" />Start Workout</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated with Health Tips</h2>
          <p className="text-xl mb-8 opacity-90">Get weekly health insights, recipes, and wellness tips delivered to your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input type="email" placeholder="Enter your email" className="bg-white/10 border-white/30 text-white placeholder:text-white/70 flex-1" />
            <Button variant="hero" className="sm:w-auto"><Calendar className="h-4 w-4 mr-2" />Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthyLivingPage;
