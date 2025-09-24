import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  Apple, 
  Dumbbell, 
  Brain, 
  Moon, 
  Droplets,
  Search,
  Clock,
  User,
  BookOpen,
  Play,
  Star,
  TrendingUp,
  Calendar,
  Share2
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const HealthyLivingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { icon: Heart, name: "Heart Health", count: 24, color: "bg-red-500" },
    { icon: Apple, name: "Nutrition", count: 32, color: "bg-green-500" },
    { icon: Dumbbell, name: "Fitness", count: 28, color: "bg-blue-500" },
    { icon: Brain, name: "Mental Health", count: 19, color: "bg-purple-500" },
    { icon: Moon, name: "Sleep", count: 15, color: "bg-indigo-500" },
    { icon: Droplets, name: "Hydration", count: 12, color: "bg-cyan-500" }
  ];

  const featuredArticles = [
    {
      id: 1,
      title: "10 Heart-Healthy Foods to Add to Your Diet",
      excerpt: "Discover the power foods that can help protect your cardiovascular system and improve your overall heart health.",
      category: "Heart Health",
      readTime: "5 min read",
      author: "Dr. Sarah Johnson",
      publishDate: "2 days ago",
      image: "/api/placeholder/400/250",
      rating: 4.8,
      views: 1254
    },
    {
      id: 2,
      title: "The Complete Guide to Better Sleep Hygiene",
      excerpt: "Learn evidence-based strategies to improve your sleep quality and wake up feeling more refreshed and energized.",
      category: "Sleep",
      readTime: "8 min read",
      author: "Dr. Michael Chen",
      publishDate: "1 week ago",
      image: "/api/placeholder/400/250",
      rating: 4.9,
      views: 2103
    },
    {
      id: 3,
      title: "Managing Stress: 7 Proven Techniques for Mental Wellness",
      excerpt: "Effective stress management strategies that you can implement today to improve your mental health and overall wellbeing.",
      category: "Mental Health",
      readTime: "6 min read",
      author: "Dr. Emily Rodriguez",
      publishDate: "3 days ago",
      image: "/api/placeholder/400/250",
      rating: 4.7,
      views: 987
    }
  ];

  const quickTips = [
    {
      icon: Droplets,
      tip: "Drink water first thing in the morning",
      description: "Start your day with a glass of water to kickstart your metabolism and rehydrate your body."
    },
    {
      icon: Dumbbell,
      tip: "Take the stairs instead of elevator",
      description: "Simple changes like taking stairs can significantly increase your daily physical activity."
    },
    {
      icon: Apple,
      tip: "Eat colorful fruits and vegetables",
      description: "Different colors provide different nutrients. Aim for a rainbow on your plate every day."
    },
    {
      icon: Brain,
      tip: "Practice mindfulness for 5 minutes",
      description: "Even short meditation sessions can reduce stress and improve mental clarity."
    }
  ];

  const healthyRecipes = [
    {
      id: 1,
      name: "Mediterranean Quinoa Bowl",
      prepTime: "15 min",
      calories: "420",
      difficulty: "Easy",
      category: "Heart Healthy"
    },
    {
      id: 2,
      name: "Green Smoothie Power Pack",
      prepTime: "5 min",
      calories: "280",
      difficulty: "Easy",
      category: "Detox"
    },
    {
      id: 3,
      name: "Baked Salmon with Herbs",
      prepTime: "25 min",
      calories: "350",
      difficulty: "Medium",
      category: "Protein Rich"
    }
  ];

  const workoutPlans = [
    {
      id: 1,
      name: "Morning Energy Boost",
      duration: "15 min",
      level: "Beginner",
      exercises: 8,
      category: "Cardio"
    },
    {
      id: 2,
      name: "Strength Building Basics",
      duration: "30 min",
      level: "Intermediate",
      exercises: 12,
      category: "Strength"
    },
    {
      id: 3,
      name: "Yoga for Better Sleep",
      duration: "20 min",
      level: "All Levels",
      exercises: 10,
      category: "Flexibility"
    }
  ];

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
              Discover expert advice, proven tips, and personalized guidance to help you live your healthiest life. Your wellness journey starts here.
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
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Explore Health Topics
            </h2>
            <p className="text-muted-foreground text-lg">
              Find expert guidance on the health areas that matter most to you
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {category.count} articles
                    </p>
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
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Featured Health Articles
              </h2>
              <p className="text-muted-foreground">
                Latest insights from our medical experts
              </p>
            </div>
            <Button variant="outline">
              View All Articles
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary-light/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-white text-primary">
                    {article.category}
                  </Badge>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-3 w-3" />
                      <span>{article.views.toLocaleString()} views</span>
                      <Star className="h-3 w-3 ml-auto" />
                      <span>{article.rating}</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{article.publishDate}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="medical" size="sm">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Read
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Daily Wellness Tips
            </h2>
            <p className="text-muted-foreground text-lg">
              Simple habits that make a big difference in your health
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 text-center group">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {tip.tip}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {tip.description}
                    </p>
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
                <h2 className="text-2xl font-bold text-foreground">
                  Healthy Recipes
                </h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {healthyRecipes.map((recipe) => (
                  <Card key={recipe.id} className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground">{recipe.name}</h3>
                        <Badge variant="secondary">{recipe.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{recipe.prepTime}</span>
                        </div>
                        <div>{recipe.calories} cal</div>
                        <div>{recipe.difficulty}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Workout Plans */}
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  Workout Plans
                </h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {workoutPlans.map((workout) => (
                  <Card key={workout.id} className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground">{workout.name}</h3>
                        <Badge variant="secondary">{workout.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{workout.duration}</span>
                        </div>
                        <div>{workout.level}</div>
                        <div>{workout.exercises} exercises</div>
                      </div>
                      <Button variant="medical" size="sm" className="w-full">
                        <Play className="h-3 w-3 mr-1" />
                        Start Workout
                      </Button>
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
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated with Health Tips
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get weekly health insights, recipes, and wellness tips delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border-white/30 text-white placeholder:text-white/70 flex-1"
            />
            <Button variant="hero" className="sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthyLivingPage;