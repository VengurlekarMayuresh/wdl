import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  BookOpen, 
  Heart,
  MessageSquare,
  ThumbsUp,
  Star,
  TrendingUp,
  Download,
  Printer,
  Eye,
  Tag,
  ChevronRight,
  Coffee,
  Bookmark,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  CheckCircle2,
  MousePointer2,
  Sparkles,
  Award,
  Target,
  Zap,
  Brain,
  Timer,
  Users2,
  Verified,
  Quote,
  ArrowUp,
  Menu,
  X,
  Search,
  Filter,
  TrendingDown,
  Settings,
  UserPlus,
  Send,
  Mail,
  Check,
  Users,
  FileText,
  ArrowRight
} from 'lucide-react';

// Full blog post content
const blogPosts = {
  1: {
    id: 1,
    title: '10 Evidence-Based Benefits of Daily Walking',
    excerpt: 'Discover how a simple 30-minute walk can transform your physical and mental health, backed by scientific research.',
    category: 'Fitness',
    author: 'Dr. Sarah Johnson',
    authorBio: 'Dr. Sarah Johnson is a board-certified physician specializing in preventive medicine with over 15 years of experience in lifestyle medicine.',
    readTime: '7 min read',
    views: 12547,
    rating: 4.9,
    publishDate: '2024-01-15',
    featured: true,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    tags: ['walking', 'exercise', 'health', 'fitness', 'cardio'],
    content: `
<h2>Walking: The Ultimate Medicine</h2>
<p>In our fast-paced world, we often overlook the simplest forms of exercise. Walking, one of humanity's most basic activities, has been scientifically proven to be one of the most powerful tools for improving both physical and mental health.</p>

<h3>1. Cardiovascular Health Improvement</h3>
<p>Regular walking significantly reduces the risk of heart disease. A study published in the American Journal of Preventive Medicine found that walking for just 30 minutes a day can reduce the risk of coronary heart disease by approximately 35%.</p>

<blockquote>
"Walking is man's best medicine." - Hippocrates
</blockquote>

<h3>2. Weight Management</h3>
<p>Walking burns calories effectively while being gentle on joints. A 155-pound person burns approximately 140 calories during a 30-minute brisk walk. This low-impact exercise is sustainable for people of all fitness levels.</p>

<h3>3. Mental Health Benefits</h3>
<p>Walking releases endorphins, which are natural mood lifters. Studies show that a 10-minute walk can be as effective as a 45-minute workout in boosting mood and reducing anxiety.</p>

<h3>4. Improved Sleep Quality</h3>
<p>Regular walkers report better sleep quality and fall asleep faster. The physical activity helps regulate circadian rhythms and reduces stress hormones that can interfere with sleep.</p>

<h3>5. Enhanced Creativity</h3>
<p>Stanford research found that walking increases creative output by an average of 60%. Many great thinkers, from Aristotle to Steve Jobs, were known for their walking meetings.</p>

<h3>6. Bone Health</h3>
<p>Weight-bearing exercises like walking help maintain bone density and reduce the risk of osteoporosis, especially important as we age.</p>

<h3>7. Immune System Boost</h3>
<p>Moderate exercise like walking can boost immune function. Regular walkers have 43% fewer sick days than sedentary individuals.</p>

<h3>8. Blood Sugar Control</h3>
<p>Post-meal walks help regulate blood sugar levels. A 15-minute walk after eating can significantly reduce blood sugar spikes.</p>

<h3>9. Longevity</h3>
<p>Research shows that walking just 4,400 steps per day is associated with a 40% reduction in mortality risk compared to walking 2,700 steps per day.</p>

<h3>10. Social Connection</h3>
<p>Walking with friends or family provides social interaction, which is crucial for mental health and overall well-being.</p>

<h2>Getting Started: Your Walking Plan</h2>
<ul>
<li><strong>Week 1-2:</strong> Start with 10-15 minutes of casual walking</li>
<li><strong>Week 3-4:</strong> Increase to 20-25 minutes at a moderate pace</li>
<li><strong>Week 5+:</strong> Aim for 30 minutes of brisk walking most days</li>
</ul>

<h2>Tips for Success</h2>
<ul>
<li>Choose comfortable, supportive walking shoes</li>
<li>Start slowly and gradually increase intensity</li>
<li>Walk with friends or family for motivation</li>
<li>Use a pedometer or smartphone app to track progress</li>
<li>Find scenic routes to make walking more enjoyable</li>
</ul>

<h2>Conclusion</h2>
<p>Walking is a simple, accessible, and incredibly effective form of exercise. With just 30 minutes a day, you can dramatically improve your physical health, mental well-being, and quality of life. Start today – your future self will thank you.</p>
    `
  },
  2: {
    id: 2,
    title: 'Mediterranean Diet: Complete Beginner\'s Guide',
    excerpt: 'Learn about one of the world\'s healthiest eating patterns and how to incorporate it into your daily routine.',
    category: 'Nutrition',
    author: 'Maria Rodriguez, RD',
    authorBio: 'Maria Rodriguez is a registered dietitian with a Master\'s degree in Nutrition Science and 12 years of experience helping people achieve their health goals.',
    readTime: '12 min read',
    views: 18953,
    rating: 4.8,
    publishDate: '2024-01-10',
    featured: true,
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    tags: ['mediterranean', 'diet', 'nutrition', 'healthy-eating', 'longevity'],
    content: `
<h2>What is the Mediterranean Diet?</h2>
<p>The Mediterranean diet is based on the traditional eating patterns of countries bordering the Mediterranean Sea, including Greece, Italy, Spain, and southern France. This diet has been extensively studied and consistently ranks as one of the world's healthiest eating patterns.</p>

<h3>Core Principles</h3>
<ul>
<li>Abundant plant foods (fruits, vegetables, legumes, nuts, seeds)</li>
<li>Olive oil as the primary source of dietary fat</li>
<li>Moderate amounts of fish and poultry</li>
<li>Limited red meat consumption</li>
<li>Fresh, seasonal, and minimally processed foods</li>
<li>Moderate wine consumption with meals (optional)</li>
</ul>

<h2>Health Benefits</h2>

<h3>Heart Health</h3>
<p>The Mediterranean diet reduces the risk of heart disease by up to 30%. The high content of monounsaturated fats from olive oil and omega-3 fatty acids from fish contribute to improved cardiovascular health.</p>

<h3>Brain Health</h3>
<p>Studies suggest that following a Mediterranean diet may reduce the risk of cognitive decline and Alzheimer's disease by up to 40%.</p>

<h3>Weight Management</h3>
<p>Despite being relatively high in fats, the Mediterranean diet promotes healthy weight management through its emphasis on whole foods and fiber-rich ingredients.</p>

<h3>Diabetes Prevention</h3>
<p>The diet can reduce the risk of developing type 2 diabetes by approximately 52%, thanks to its low glycemic index foods and anti-inflammatory properties.</p>

<h2>Foods to Emphasize</h2>

<h3>Daily Consumption</h3>
<ul>
<li><strong>Vegetables:</strong> 2-3 servings (tomatoes, leafy greens, peppers, onions)</li>
<li><strong>Fruits:</strong> 2-3 servings (fresh, seasonal fruits)</li>
<li><strong>Whole grains:</strong> 3-4 servings (brown rice, quinoa, whole wheat bread)</li>
<li><strong>Olive oil:</strong> 2-4 tablespoons</li>
<li><strong>Nuts and seeds:</strong> 1 ounce</li>
</ul>

<h3>Weekly Consumption</h3>
<ul>
<li><strong>Fish:</strong> 2-3 servings (salmon, sardines, mackerel)</li>
<li><strong>Poultry:</strong> 1-2 servings</li>
<li><strong>Eggs:</strong> 2-4 eggs</li>
<li><strong>Legumes:</strong> 2-3 servings</li>
</ul>

<h3>Limited Consumption</h3>
<ul>
<li><strong>Red meat:</strong> 2-3 servings per month</li>
<li><strong>Processed foods:</strong> Minimize or avoid</li>
<li><strong>Refined sugars:</strong> Occasional treats only</li>
</ul>

<h2>Sample Meal Plan</h2>

<h3>Breakfast</h3>
<p>Greek yogurt with berries, walnuts, and a drizzle of honey</p>

<h3>Lunch</h3>
<p>Mediterranean chickpea salad with tomatoes, cucumber, feta cheese, and olive oil dressing</p>

<h3>Snack</h3>
<p>Apple slices with almond butter</p>

<h3>Dinner</h3>
<p>Grilled salmon with roasted vegetables and quinoa</p>

<h2>Getting Started: Week 1 Plan</h2>
<ol>
<li>Replace butter with extra virgin olive oil</li>
<li>Add a serving of fish to your weekly menu</li>
<li>Include a handful of nuts as a daily snack</li>
<li>Eat at least one meatless meal per day</li>
<li>Choose whole grain versions of bread and pasta</li>
</ol>

<h2>Shopping List Essentials</h2>
<ul>
<li>Extra virgin olive oil</li>
<li>Fresh vegetables (tomatoes, cucumbers, bell peppers)</li>
<li>Seasonal fruits</li>
<li>Fish (salmon, sardines, tuna)</li>
<li>Legumes (chickpeas, lentils, beans)</li>
<li>Whole grains (quinoa, brown rice, oats)</li>
<li>Nuts and seeds</li>
<li>Greek yogurt</li>
<li>Feta cheese</li>
<li>Fresh herbs (basil, oregano, parsley)</li>
</ul>

<h2>Conclusion</h2>
<p>The Mediterranean diet isn't just a diet – it's a lifestyle that promotes longevity, health, and enjoyment of food. Start gradually by making small changes, and soon you'll be reaping the numerous health benefits of this time-tested eating pattern.</p>
    `
  },
  3: {
    id: 3,
    title: 'Mindfulness Meditation for Stress Relief',
    excerpt: 'Reduce stress and anxiety with simple mindfulness techniques you can practice anywhere, anytime.',
    category: 'Mental Health',
    author: 'Lisa Thompson, LMFT',
    authorBio: 'Lisa Thompson is a licensed marriage and family therapist with specialization in mindfulness-based stress reduction and anxiety treatment.',
    readTime: '8 min read',
    views: 15432,
    rating: 4.9,
    publishDate: '2024-01-05',
    featured: true,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    tags: ['mindfulness', 'meditation', 'stress-relief', 'mental-health', 'wellness'],
    content: `
<h2>Understanding Mindfulness</h2>
<p>Mindfulness is the practice of purposefully paying attention to the present moment without judgment. Rooted in Buddhist traditions but now backed by extensive scientific research, mindfulness has become a powerful tool for managing stress, anxiety, and improving overall well-being.</p>

<h3>The Science Behind Mindfulness</h3>
<p>Research shows that regular mindfulness practice can physically change the brain, reducing activity in the amygdala (fear center) while strengthening the prefrontal cortex (responsible for executive function and emotional regulation).</p>

<h2>Benefits of Mindfulness Meditation</h2>

<h3>Stress Reduction</h3>
<p>Studies show that mindfulness can reduce cortisol levels by up to 23%, leading to decreased stress and improved immune function.</p>

<h3>Anxiety Management</h3>
<p>Regular practice can reduce anxiety symptoms by 58% and help prevent anxiety disorders from developing.</p>

<h3>Improved Focus</h3>
<p>Mindfulness training increases attention span and reduces mind-wandering by strengthening neural pathways associated with concentration.</p>

<h3>Better Sleep</h3>
<p>Mindfulness practices can improve sleep quality by calming the mind and reducing racing thoughts that often interfere with rest.</p>

<h3>Emotional Regulation</h3>
<p>Regular practitioners report better emotional stability and improved relationships due to increased empathy and reduced reactivity.</p>

<h2>Basic Mindfulness Techniques</h2>

<h3>1. Breathing Meditation</h3>
<ol>
<li>Find a comfortable seated position</li>
<li>Close your eyes or soften your gaze</li>
<li>Focus on your breath, feeling the sensation of breathing in and out</li>
<li>When your mind wanders, gently return attention to your breath</li>
<li>Start with 5 minutes and gradually increase</li>
</ol>

<h3>2. Body Scan Meditation</h3>
<ol>
<li>Lie down comfortably</li>
<li>Start by focusing on your toes, noticing any sensations</li>
<li>Slowly move your attention up through your body</li>
<li>Notice areas of tension without trying to change them</li>
<li>Complete the scan from toes to head over 10-20 minutes</li>
</ol>

<h3>3. Walking Meditation</h3>
<ol>
<li>Walk slowly and deliberately</li>
<li>Focus on the sensation of your feet touching the ground</li>
<li>Notice the movement of your legs and the rhythm of your steps</li>
<li>If your mind wanders, gently return to the physical sensations of walking</li>
</ol>

<h2>Mindfulness for Specific Situations</h2>

<h3>During Work Stress</h3>
<ul>
<li>Take three conscious breaths before responding to emails</li>
<li>Set reminders to pause and check in with your body</li>
<li>Practice mindful eating during lunch breaks</li>
</ul>

<h3>In Traffic or Commuting</h3>
<ul>
<li>Focus on your hands on the steering wheel</li>
<li>Notice your breathing while waiting at red lights</li>
<li>Practice acceptance of situations beyond your control</li>
</ul>

<h3>Before Sleep</h3>
<ul>
<li>Practice gratitude by listing three positive moments from the day</li>
<li>Do a brief body scan to release physical tension</li>
<li>Focus on breath to quiet mental chatter</li>
</ul>

<h2>Building a Daily Practice</h2>

<h3>Week 1: Foundation (5 minutes daily)</h3>
<ul>
<li>Choose the same time each day</li>
<li>Start with basic breathing meditation</li>
<li>Use a meditation app if helpful</li>
</ul>

<h3>Week 2-3: Expansion (10 minutes daily)</h3>
<ul>
<li>Add body scan or walking meditation</li>
<li>Practice informal mindfulness during daily activities</li>
<li>Notice thoughts without engaging with them</li>
</ul>

<h3>Week 4+: Integration (15+ minutes daily)</h3>
<ul>
<li>Experiment with different techniques</li>
<li>Apply mindfulness to challenging situations</li>
<li>Consider joining a meditation group or class</li>
</ul>

<h2>Common Challenges and Solutions</h2>

<h3>"My mind is too busy to meditate"</h3>
<p>This is exactly why you need to meditate! A busy mind is normal – the practice is noticing when your mind wanders and gently returning to the present.</p>

<h3>"I don't have time"</h3>
<p>Start with just 2-3 minutes. Even brief moments of mindfulness can be beneficial. Remember, you're not adding to your to-do list – you're improving your ability to handle everything on it.</p>

<h3>"I fall asleep during meditation"</h3>
<p>Try meditating with your eyes slightly open or in a more upright position. If you're consistently falling asleep, you may need more rest.</p>

<h2>Resources for Deeper Learning</h2>
<ul>
<li><strong>Apps:</strong> Headspace, Calm, Insight Timer</li>
<li><strong>Books:</strong> "The Power of Now" by Eckhart Tolle, "Wherever You Go, There You Are" by Jon Kabat-Zinn</li>
<li><strong>Programs:</strong> Mindfulness-Based Stress Reduction (MBSR) courses</li>
</ul>

<h2>Conclusion</h2>
<p>Mindfulness meditation is a powerful, accessible tool for managing stress and improving overall quality of life. With regular practice, you can develop greater emotional resilience, improved focus, and a deeper sense of peace. Start small, be patient with yourself, and remember that every moment of mindfulness is beneficial.</p>
    `
  },
  4: {
    id: 4,
    title: 'Hydration: How Much Water Do You Really Need?',
    excerpt: 'Debunking hydration myths and providing evidence-based recommendations for optimal fluid intake.',
    category: 'Hydration',
    author: 'Dr. Amanda Foster',
    authorBio: 'Dr. Amanda Foster is a sports medicine physician and hydration specialist with research published in leading medical journals.',
    readTime: '6 min read',
    views: 8765,
    rating: 4.6,
    publishDate: '2024-01-03',
    featured: true,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    tags: ['hydration', 'water', 'health', 'nutrition', 'wellness'],
    content: `
<h2>The Truth About Hydration</h2>
<p>Water is essential for life, comprising about 60% of the adult human body. Despite its importance, there's considerable confusion about how much water we actually need. Let's separate fact from fiction and provide you with evidence-based guidance.</p>

<h3>Debunking the "8x8" Rule</h3>
<p>The popular advice to drink eight 8-ounce glasses of water daily isn't based on solid scientific evidence. Your hydration needs are individual and depend on numerous factors including activity level, climate, health status, and body size.</p>

<h2>How Much Water Do You Really Need?</h2>

<h3>General Guidelines</h3>
<ul>
<li><strong>Men:</strong> About 15.5 cups (3.7 liters) of total fluids daily</li>
<li><strong>Women:</strong> About 11.5 cups (2.7 liters) of total fluids daily</li>
<li><strong>Children:</strong> 5-8 cups (1.2-1.9 liters) depending on age</li>
</ul>

<p><em>Note: These recommendations include fluids from all beverages and food, not just plain water.</em></p>

<h3>Factors That Increase Fluid Needs</h3>

<h4>Exercise and Physical Activity</h4>
<p>You need additional fluid to replace what you lose through sweating. Drink 14-22 ounces of water 2-4 hours before exercise, and 6-12 ounces every 15-20 minutes during activity.</p>

<h4>Hot or Humid Weather</h4>
<p>Increased sweating in warm conditions can increase fluid needs by 16-24 ounces per day.</p>

<h4>High Altitude</h4>
<p>Altitudes above 8,200 feet can increase fluid needs due to faster breathing and increased urination.</p>

<h4>Illness</h4>
<p>Fever, vomiting, or diarrhea can cause significant fluid loss requiring increased intake.</p>

<h4>Pregnancy and Breastfeeding</h4>
<p>Pregnant women need about 10 cups daily, while breastfeeding mothers need approximately 13 cups.</p>

<h2>Signs of Proper Hydration</h2>

<h3>Positive Indicators</h3>
<ul>
<li>Pale yellow urine (like lemonade)</li>
<li>Urinating every 2-4 hours</li>
<li>Moist lips and mouth</li>
<li>Skin that bounces back quickly when pinched</li>
<li>Steady energy levels</li>
</ul>

<h3>Dehydration Warning Signs</h3>
<ul>
<li>Dark yellow or amber urine</li>
<li>Infrequent urination</li>
<li>Dry mouth and lips</li>
<li>Headache</li>
<li>Fatigue</li>
<li>Dizziness</li>
<li>Constipation</li>
</ul>

<h2>Hydration Sources</h2>

<h3>Water from Food (20% of daily intake)</h3>
<ul>
<li><strong>High water content:</strong> Watermelon (92%), cucumbers (95%), lettuce (96%)</li>
<li><strong>Moderate water content:</strong> Oranges (87%), milk (89%), yogurt (85%)</li>
<li><strong>Surprising sources:</strong> Cooked oatmeal (84%), chicken breast (65%)</li>
</ul>

<h3>Beverages That Count</h3>
<ul>
<li>Plain water</li>
<li>Herbal teas</li>
<li>Milk</li>
<li>100% fruit juices (in moderation)</li>
<li>Coffee and tea (despite mild diuretic effect)</li>
</ul>

<h2>Quality Matters: Choosing Your Water</h2>

<h3>Tap Water</h3>
<p>In most developed countries, tap water is safe and well-regulated. It often contains beneficial minerals and is the most environmentally friendly option.</p>

<h3>Bottled Water</h3>
<p>Not necessarily purer than tap water. Check the source and consider the environmental impact of plastic bottles.</p>

<h3>Filtered Water</h3>
<p>Can improve taste and remove chlorine, but most filters don't remove beneficial minerals.</p>

<h2>Special Considerations</h2>

<h3>Athletes and Active Individuals</h3>
<ul>
<li>Weigh yourself before and after exercise</li>
<li>Drink 16-24 ounces for every pound lost</li>
<li>Consider electrolyte replacement for activities over 60 minutes</li>
</ul>

<h3>Older Adults</h3>
<ul>
<li>Thirst sensation decreases with age</li>
<li>Kidney function may decline</li>
<li>Medications can affect fluid balance</li>
<li>Set regular hydration reminders</li>
</ul>

<h3>People with Certain Health Conditions</h3>
<p>Heart failure, kidney disease, or liver problems may require fluid restrictions. Always consult your healthcare provider for personalized recommendations.</p>

<h2>Practical Hydration Tips</h2>

<h3>Make Water More Appealing</h3>
<ul>
<li>Add fresh fruit slices (lemon, lime, berries)</li>
<li>Try sparkling water with natural flavors</li>
<li>Infuse with herbs like mint or basil</li>
<li>Serve at your preferred temperature</li>
</ul>

<h3>Hydration Habits</h3>
<ul>
<li>Start your day with a glass of water</li>
<li>Keep a water bottle visible</li>
<li>Drink water before, during, and after meals</li>
<li>Set phone reminders if needed</li>
<li>Eat water-rich foods</li>
</ul>

<h2>When to Seek Medical Advice</h2>
<p>Consult a healthcare provider if you experience:</p>
<ul>
<li>Persistent dark urine despite adequate fluid intake</li>
<li>Excessive thirst</li>
<li>Swelling in hands, feet, or face</li>
<li>Difficulty keeping fluids down</li>
<li>Signs of severe dehydration</li>
</ul>

<h2>Conclusion</h2>
<p>Optimal hydration is about more than just drinking water – it's about maintaining fluid balance through various sources while listening to your body's needs. Focus on the color of your urine, your energy levels, and how you feel rather than forcing yourself to drink a specific amount. Remember, your hydration needs are unique to you and may vary day by day.</p>
    `
  },
  5: {
    id: 5,
    title: 'Building Healthy Habits That Actually Stick',
    excerpt: 'Psychology-backed strategies for creating lasting positive changes in your daily routine.',
    category: 'Wellness',
    author: 'Dr. James Wilson',
    authorBio: 'Dr. James Wilson is a behavioral psychologist specializing in habit formation and behavior change with over 20 years of research experience.',
    readTime: '10 min read',
    views: 11234,
    rating: 4.8,
    publishDate: '2024-01-01',
    featured: true,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    tags: ['habits', 'wellness', 'psychology', 'behavior-change', 'self-improvement'],
    content: `
<h2>The Science of Habit Formation</h2>
<p>Habits account for about 40% of our daily behaviors, yet most people struggle to create positive habits that stick. Understanding the neuroscience and psychology behind habit formation is key to successfully implementing lasting changes in your life.</p>

<h3>The Habit Loop</h3>
<p>Every habit follows a three-part neurological loop:</p>
<ol>
<li><strong>Cue:</strong> The trigger that initiates the behavior</li>
<li><strong>Routine:</strong> The behavior itself</li>
<li><strong>Reward:</strong> The benefit you gain from the behavior</li>
</ol>

<p>Understanding this loop allows you to design new habits and modify existing ones effectively.</p>

<h2>Why Most Habits Fail</h2>

<h3>Common Mistakes</h3>
<ul>
<li><strong>Starting too big:</strong> Attempting dramatic changes that are unsustainable</li>
<li><strong>Relying on motivation:</strong> Motivation fluctuates; systems and environment matter more</li>
<li><strong>Perfectionism:</strong> All-or-nothing thinking leads to abandonment after setbacks</li>
<li><strong>Lack of specificity:</strong> Vague goals like "exercise more" without clear parameters</li>
<li><strong>No environmental design:</strong> Not setting up your environment for success</li>
</ul>

<h2>The Psychology-Backed Approach</h2>

<h3>1. Start Ridiculously Small</h3>
<p>Research by BJ Fogg at Stanford shows that tiny habits are more likely to stick. Instead of "exercise for 30 minutes," start with "do one push-up" or "walk to the mailbox."</p>

<blockquote>
"People change best by feeling good, not by feeling bad." - BJ Fogg, Stanford Behavior Scientist
</blockquote>

<h3>2. Stack Your Habits</h3>
<p>Attach new habits to existing routines using the formula: "After I [existing habit], I will [new habit]."</p>

<p><strong>Examples:</strong></p>
<ul>
<li>After I pour my morning coffee, I will write one sentence in my journal</li>
<li>After I brush my teeth, I will do five squats</li>
<li>After I sit down at my desk, I will write down my top three priorities</li>
</ul>

<h3>3. Design Your Environment</h3>
<p>Your environment shapes your behavior more than willpower. Make good habits obvious and bad habits invisible.</p>

<h4>For Exercise:</h4>
<ul>
<li>Lay out workout clothes the night before</li>
<li>Keep sneakers by the door</li>
<li>Set up a designated exercise space</li>
</ul>

<h4>For Healthy Eating:</h4>
<ul>
<li>Prep healthy snacks and put them at eye level</li>
<li>Keep fruits on the counter</li>
<li>Store junk food in opaque containers</li>
</ul>

<h2>The Four Laws of Behavior Change</h2>

<h3>Law 1: Make It Obvious</h3>
<ul>
<li>Use implementation intentions: "I will [behavior] at [time] in [location]"</li>
<li>Create visual cues in your environment</li>
<li>Use habit stacking to link new habits to established ones</li>
</ul>

<h3>Law 2: Make It Attractive</h3>
<ul>
<li>Pair habits you need to do with habits you want to do</li>
<li>Join a culture where your desired behavior is normal</li>
<li>Focus on the immediate benefits</li>
</ul>

<h3>Law 3: Make It Easy</h3>
<ul>
<li>Reduce friction for good habits</li>
<li>Use the two-minute rule: scale habits down until they can be done in two minutes</li>
<li>Invest in tools and technology that make habits easier</li>
</ul>

<h3>Law 4: Make It Satisfying</h3>
<ul>
<li>Use immediate rewards</li>
<li>Track your habits visually</li>
<li>Never miss twice in a row</li>
</ul>

<h2>Building Specific Healthy Habits</h2>

<h3>Exercise Habits</h3>
<p><strong>Start small:</strong> 2 minutes of movement after waking up</p>
<p><strong>Environmental design:</strong> Keep workout equipment visible</p>
<p><strong>Reward:</strong> Listen to favorite music or podcast only during exercise</p>

<h3>Nutrition Habits</h3>
<p><strong>Start small:</strong> Add one vegetable to one meal</p>
<p><strong>Environmental design:</strong> Prep healthy snacks in advance</p>
<p><strong>Reward:</strong> Use a special plate for healthy meals</p>

<h3>Sleep Habits</h3>
<p><strong>Start small:</strong> Put phone in another room 5 minutes earlier each night</p>
<p><strong>Environmental design:</strong> Blackout curtains and cool temperature</p>
<p><strong>Reward:</strong> Read something enjoyable before bed</p>

<h3>Stress Management Habits</h3>
<p><strong>Start small:</strong> Take three deep breaths when sitting down at your desk</p>
<p><strong>Environmental design:</strong> Set phone reminders for breathing breaks</p>
<p><strong>Reward:</strong> Brief moment of gratitude after each stress-relief practice</p>

<h2>The Power of Identity-Based Habits</h2>

<h3>Focus on Who You Want to Become</h3>
<p>Instead of focusing on outcomes, focus on identity. Ask yourself: "What would a healthy person do?"</p>

<h4>Identity Shifts:</h4>
<ul>
<li>"I'm trying to quit smoking" → "I'm not a smoker"</li>
<li>"I want to lose weight" → "I'm someone who takes care of their body"</li>
<li>"I should read more" → "I'm a reader"</li>
</ul>

<h3>Prove Your Identity with Small Wins</h3>
<p>Every action you take is a vote for the type of person you wish to become. The more evidence you have for a belief, the more strongly you believe it.</p>

<h2>Overcoming Common Obstacles</h2>

<h3>Dealing with Setbacks</h3>
<ul>
<li><strong>Expect them:</strong> Setbacks are part of the process, not evidence of failure</li>
<li><strong>Never miss twice:</strong> Get back on track as quickly as possible</li>
<li><strong>Focus on systems:</strong> If you're having trouble changing your habits, the problem isn't you; it's your system</li>
</ul>

<h3>Maintaining Motivation</h3>
<ul>
<li><strong>Track progress:</strong> Visual progress is motivating</li>
<li><strong>Find an accountability partner:</strong> Share your goals with someone who will check in</li>
<li><strong>Celebrate small wins:</strong> Acknowledge progress, no matter how small</li>
</ul>

<h2>The 21-Day Myth Debunked</h2>
<p>Contrary to popular belief, habits don't form in 21 days. Research shows it takes an average of 66 days for a behavior to become automatic, with a range of 18-254 days depending on the complexity of the habit and individual differences.</p>

<h2>Creating Your Personal Habit Plan</h2>

<h3>Step 1: Choose One Habit</h3>
<p>Focus on one habit at a time. Success with one habit builds confidence for others.</p>

<h3>Step 2: Make It Specific</h3>
<p>Instead of "eat healthier," try "eat one serving of vegetables with lunch."</p>

<h3>Step 3: Start Smaller Than You Think</h3>
<p>Make it so easy you can't say no. You can always do more once you start.</p>

<h3>Step 4: Set Up Your Environment</h3>
<p>Remove barriers to good habits and add barriers to bad habits.</p>

<h3>Step 5: Track Your Progress</h3>
<p>Use a simple habit tracker or calendar to mark your successes.</p>

<h3>Step 6: Be Patient</h3>
<p>Focus on consistency over perfection. Small improvements compound over time.</p>

<h2>Conclusion</h2>
<p>Building lasting healthy habits isn't about willpower or motivation – it's about understanding human psychology and designing systems that work with your brain, not against it. Start small, be consistent, and focus on who you want to become. Remember, you don't rise to the level of your goals; you fall to the level of your systems. Make your systems work for you, and lasting change will follow naturally.</p>
    `
  }
};

const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  const [showTOC, setShowTOC] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    // Find the post by ID
    const foundPost = blogPosts[parseInt(id)];
    
    if (foundPost) {
      setPost(foundPost);
      
      // Calculate reading time (average 200 words per minute)
      const wordCount = foundPost.content.replace(/<[^>]*>/g, '').split(' ').length;
      setEstimatedReadTime(Math.ceil(wordCount / 200));
      
      // Set initial like count (simulate with views/100)
      setLikeCount(Math.floor(foundPost.views / 100));
      
      // Get related posts (same category, different post)
      const related = Object.values(blogPosts)
        .filter(p => p.category === foundPost.category && p.id !== foundPost.id)
        .slice(0, 3);
      setRelatedPosts(related);
    }
    setLoading(false);
  }, [id]);

  // Scroll tracking for reading progress and scroll-to-top
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (scrollTop / docHeight) * 100;
      
      setReadingProgress(scrollProgress);
      setShowScrollTop(scrollTop > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getUserInitial = () => {
    if (isAuthenticated && user) {
      return (user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase();
    }
    return 'G';
  };

  // Enhanced helper functions
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In real app, this would save to user's bookmarks
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post?.title || 'Health Article';
    const text = post?.excerpt || '';
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        // Show success message
        break;
    }
    setShowShareMenu(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatReadingTime = (minutes) => {
    return minutes === 1 ? '1 min read' : `${minutes} min read`;
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'fitness': return Target;
      case 'nutrition': return Award;
      case 'mental health': return Brain;
      case 'hydration': return Zap;
      case 'wellness': return Sparkles;
      default: return BookOpen;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header 
          isAuthenticated={isAuthenticated}
          userInitial={getUserInitial()}
          userType={user?.userType || 'guest'}
          onLogout={logout}
          showSearch={true}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/healthy-living')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Health Tips
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header 
        isAuthenticated={isAuthenticated}
        userInitial={getUserInitial()}
        userType={user?.userType || 'guest'}
        onLogout={logout}
        showSearch={true}
      />

      {/* Hero Section with Background Image */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${post.image})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back Navigation */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/healthy-living')}
              className="text-white hover:bg-white/20 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Health Tips
            </Button>
          </div>
          
          {/* Category Badge */}
          <Badge className="bg-white/20 text-white border-white/30 mb-6">
            {post.category}
          </Badge>
          
          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          
          {/* Excerpt */}
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            {post.excerpt}
          </p>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.publishDate).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatReadingTime(estimatedReadTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{post.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>{post.rating}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Article Actions */}
              <div className="flex flex-wrap items-center justify-between mb-8 pb-6 border-b">
                <div className="flex flex-wrap gap-2 mb-4 lg:mb-0">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLike}
                    className={isLiked ? 'text-red-500 border-red-200 bg-red-50' : ''}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {likeCount}
                  </Button>
                  
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    
                    {/* Share Menu */}
                    {showShareMenu && (
                      <div className="absolute right-0 top-12 bg-white rounded-lg shadow-strong min-w-[160px] py-2 text-foreground border z-10">
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleShare('twitter')}>
                          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                          Twitter
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleShare('facebook')}>
                          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                          Facebook
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleShare('linkedin')}>
                          <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                          LinkedIn
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleShare('copy')}>
                          <Copy className="h-4 w-4 mr-2 text-gray-500" />
                          Copy Link
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBookmark}
                    className={isBookmarked ? 'text-yellow-500 border-yellow-200 bg-yellow-50' : ''}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    Save
                  </Button>
                </div>
              </div>


              {/* Article Body */}
              <div 
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:px-4 prose-blockquote:py-2 prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Author Bio */}
              <div className="mt-12 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">About {post.author}</h3>
                          <Badge variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Expert
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3 text-sm leading-relaxed">{post.authorBio}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            <span>15+ Articles</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users2 className="h-3 w-3" />
                            <span>50K+ Readers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-accent/30 rounded-lg">
                        <div className="text-lg font-semibold text-primary mb-1">{post.views.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Views</div>
                      </div>
                      <div className="text-center p-3 bg-accent/30 rounded-lg">
                        <div className="text-lg font-semibold text-primary mb-1">{likeCount}</div>
                        <div className="text-xs text-muted-foreground">Likes</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Reading Tools */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Tools
                    </h3>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => window.print()}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleBookmark}
                        className={`w-full justify-start ${isBookmarked ? 'text-yellow-600 border-yellow-300' : ''}`}
                      >
                        <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                        {isBookmarked ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Articles */}
                {relatedPosts.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Related
                      </h3>
                      <div className="space-y-3">
                        {relatedPosts.slice(0, 3).map((relatedPost) => (
                          <div key={relatedPost.id} className="group cursor-pointer p-2 rounded-lg hover:bg-accent/50 transition-colors" onClick={() => navigate(`/blog/${relatedPost.id}`)}>
                            <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                              {relatedPost.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{relatedPost.readTime || '5 min'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-accent/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">More in {post.category}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer group" onClick={() => navigate(`/blog/${relatedPost.id}`)}>
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary-light/20 relative overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${relatedPost.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-white text-primary">
                      {relatedPost.category}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{relatedPost.author}</span>
                      <span>{relatedPost.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
          size="icon"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default BlogPostPage;