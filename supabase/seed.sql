-- Food MBTI seed data
-- Run after schema.sql in Supabase SQL Editor.

-- Optional reset for clean reseed (uncomment if needed)
-- truncate table public.answers, public.questions, public.examinees, public.archetype_components,
--   public.archetype_personas, public.cat_types, public.categories, public.users
--   restart identity cascade;

insert into public.categories (category_name, category_desc) values
  ('Financial', 'Budget-focused vs Value-focused'),
  ('Personal', 'Wellness-focused vs Enjoyment-focused'),
  ('Effort-based', 'Convenience-leaning vs Adventure-leaning'),
  ('Trait-driven', 'Impulsive vs Habitual');

insert into public.cat_types (cat_type_name, category_id)
select v.cat_type_name, c.category_id
from (
  values
    ('Budget-focused', 'Financial'),
    ('Value-focused', 'Financial'),
    ('Wellness-focused', 'Personal'),
    ('Enjoyment-focused', 'Personal'),
    ('Convenience-leaning', 'Effort-based'),
    ('Adventure-leaning', 'Effort-based'),
    ('Impulsive', 'Trait-driven'),
    ('Habitual', 'Trait-driven')
) as v(cat_type_name, category_name)
join public.categories c
  on c.category_name = v.category_name;

insert into public.archetype_personas (archetype_name, archetype_desc) values
  ('BWCI - The Well-meaning Saver', 'Health-aware, low-cost, convenience-first, decides in the moment.'),
  ('BWAI - The Thrifty Explorer', 'Seeks healthy food, tries new things, but stays budget-conscious.'),
  ('BECI - The Practical Indulger', 'Flavor-first on a budget, prefers easy options, eats on impulse.'),
  ('BEAI - The Casual Flavor Hunter', 'Chases exciting tastes while staying price-conscious.'),
  ('BWCH - The Meal Architect', 'Plans healthy, affordable meals and sticks to efficient routines.'),
  ('BWAH - The Routine Optimizer', 'Healthy and budget-aware, explores selectively and repeatedly.'),
  ('BECH - The Comfort Economist', 'Budget-friendly comfort food, routine orders, minimal effort.'),
  ('BEAH - The Loyal Foodie', 'Enjoys flavor and novelty but returns to trusted favorites.'),
  ('VWCI - The Thrifty Explorer', 'Prioritizes nutrition and quality, keeps choices easy and flexible.'),
  ('VWAI - The Conscious Connoisseur', 'Seeks high-value, healthy food and explores what is worth it.'),
  ('VECI - The Quality Craver', 'Loves good food, prefers convenience, and decides by mood.'),
  ('VEAI - The Culinary Seeker', 'Experience-driven, quality-focused, and eager to try new food.'),
  ('VWCH - The Wellness Curator', 'Carefully plans nutritious meals with quality and consistency.'),
  ('VWAH - The Refined Eater', 'Health-focused, habitual, but always upgrading food choices.'),
  ('VECH - The Comfort Connoisseur', 'Values high-quality comfort food and sticks to trusted favorites.'),
  ('VEAH - The Experience Loyalist', 'Returns to beloved high-value spots while still enjoying exploration.');

with map as (
  select * from (
    values
      ('BWCI - The Well-meaning Saver', 'Budget-focused'),
      ('BWCI - The Well-meaning Saver', 'Wellness-focused'),
      ('BWCI - The Well-meaning Saver', 'Convenience-leaning'),
      ('BWCI - The Well-meaning Saver', 'Impulsive'),

      ('BWAI - The Thrifty Explorer', 'Budget-focused'),
      ('BWAI - The Thrifty Explorer', 'Wellness-focused'),
      ('BWAI - The Thrifty Explorer', 'Adventure-leaning'),
      ('BWAI - The Thrifty Explorer', 'Impulsive'),

      ('BECI - The Practical Indulger', 'Budget-focused'),
      ('BECI - The Practical Indulger', 'Enjoyment-focused'),
      ('BECI - The Practical Indulger', 'Convenience-leaning'),
      ('BECI - The Practical Indulger', 'Impulsive'),

      ('BEAI - The Casual Flavor Hunter', 'Budget-focused'),
      ('BEAI - The Casual Flavor Hunter', 'Enjoyment-focused'),
      ('BEAI - The Casual Flavor Hunter', 'Adventure-leaning'),
      ('BEAI - The Casual Flavor Hunter', 'Impulsive'),

      ('BWCH - The Meal Architect', 'Budget-focused'),
      ('BWCH - The Meal Architect', 'Wellness-focused'),
      ('BWCH - The Meal Architect', 'Convenience-leaning'),
      ('BWCH - The Meal Architect', 'Habitual'),

      ('BWAH - The Routine Optimizer', 'Budget-focused'),
      ('BWAH - The Routine Optimizer', 'Wellness-focused'),
      ('BWAH - The Routine Optimizer', 'Adventure-leaning'),
      ('BWAH - The Routine Optimizer', 'Habitual'),

      ('BECH - The Comfort Economist', 'Budget-focused'),
      ('BECH - The Comfort Economist', 'Enjoyment-focused'),
      ('BECH - The Comfort Economist', 'Convenience-leaning'),
      ('BECH - The Comfort Economist', 'Habitual'),

      ('BEAH - The Loyal Foodie', 'Budget-focused'),
      ('BEAH - The Loyal Foodie', 'Enjoyment-focused'),
      ('BEAH - The Loyal Foodie', 'Adventure-leaning'),
      ('BEAH - The Loyal Foodie', 'Habitual'),

      ('VWCI - The Thrifty Explorer', 'Value-focused'),
      ('VWCI - The Thrifty Explorer', 'Wellness-focused'),
      ('VWCI - The Thrifty Explorer', 'Convenience-leaning'),
      ('VWCI - The Thrifty Explorer', 'Impulsive'),

      ('VWAI - The Conscious Connoisseur', 'Value-focused'),
      ('VWAI - The Conscious Connoisseur', 'Wellness-focused'),
      ('VWAI - The Conscious Connoisseur', 'Adventure-leaning'),
      ('VWAI - The Conscious Connoisseur', 'Impulsive'),

      ('VECI - The Quality Craver', 'Value-focused'),
      ('VECI - The Quality Craver', 'Enjoyment-focused'),
      ('VECI - The Quality Craver', 'Convenience-leaning'),
      ('VECI - The Quality Craver', 'Impulsive'),

      ('VEAI - The Culinary Seeker', 'Value-focused'),
      ('VEAI - The Culinary Seeker', 'Enjoyment-focused'),
      ('VEAI - The Culinary Seeker', 'Adventure-leaning'),
      ('VEAI - The Culinary Seeker', 'Impulsive'),

      ('VWCH - The Wellness Curator', 'Value-focused'),
      ('VWCH - The Wellness Curator', 'Wellness-focused'),
      ('VWCH - The Wellness Curator', 'Convenience-leaning'),
      ('VWCH - The Wellness Curator', 'Habitual'),

      ('VWAH - The Refined Eater', 'Value-focused'),
      ('VWAH - The Refined Eater', 'Wellness-focused'),
      ('VWAH - The Refined Eater', 'Adventure-leaning'),
      ('VWAH - The Refined Eater', 'Habitual'),

      ('VECH - The Comfort Connoisseur', 'Value-focused'),
      ('VECH - The Comfort Connoisseur', 'Enjoyment-focused'),
      ('VECH - The Comfort Connoisseur', 'Convenience-leaning'),
      ('VECH - The Comfort Connoisseur', 'Habitual'),

      ('VEAH - The Experience Loyalist', 'Value-focused'),
      ('VEAH - The Experience Loyalist', 'Enjoyment-focused'),
      ('VEAH - The Experience Loyalist', 'Adventure-leaning'),
      ('VEAH - The Experience Loyalist', 'Habitual')
  ) as t(archetype_name, cat_type_name)
)
insert into public.archetype_components (cat_type_id, archetype_persona_id)
select ct.cat_type_id, ap.archetype_persona_id
from map m
join public.archetype_personas ap
  on ap.archetype_name = m.archetype_name
join public.cat_types ct
  on ct.cat_type_name = m.cat_type_name
on conflict (cat_type_id, archetype_persona_id) do nothing;

-- Minimal app records
insert into public.users (user_name, user_password)
values ('elclemente2@up.edu.ph', 'passwordpassword')
on conflict (user_name) do update
set user_password = excluded.user_password;

insert into public.questions (question_text, category_id, user_id)
select q.question_text, c.category_id, u.user_id
from (
  values
    ('I usually choose the cheapest option available when buying food. (B)', 'Financial'),
    ('I am willing to spend more if the food feels worth it. (V)', 'Financial'),
    ('I prioritize saving money over food quality. (B)', 'Financial'),
    ('I consider both price and quality before deciding what to eat. (V)', 'Financial'),
    ('I often look for budget meals or promos. (B)', 'Financial'),
    ('I do not mind paying extra for better ingredients or experience. (V)', 'Financial'),
    ('I would rather save money than spend more for better food. (B)', 'Financial'),

    ('I choose food based on how healthy it is. (W)', 'Personal'),
    ('I usually eat what I am craving, regardless of health. (E)', 'Personal'),
    ('I actively try to maintain a balanced or nutritious diet. (W)', 'Personal'),
    ('Enjoyment and taste matter more to me than nutrition. (E)', 'Personal'),
    ('I feel good when I eat something healthy. (W)', 'Personal'),
    ('I eat mainly for satisfaction and comfort. (E)', 'Personal'),
    ('I avoid unhealthy food even if it tastes good. (W)', 'Personal'),

    ('I prefer food that is quick and easy to get. (C)', 'Effort-based'),
    ('I like trying new or unfamiliar food places. (A)', 'Effort-based'),
    ('I usually stick to convenient and accessible options. (C)', 'Effort-based'),
    ('I enjoy exploring different cuisines or dishes. (A)', 'Effort-based'),
    ('I do not want to spend too much time deciding where to eat. (C)', 'Effort-based'),
    ('I am willing to go out of my way for a new food experience. (A)', 'Effort-based'),
    ('I prefer familiar places because they are easier and faster. (C)', 'Effort-based'),

    ('I decide what to eat on the spot. (I)', 'Trait-driven'),
    ('I tend to eat the same meals or go to the same places regularly. (H)', 'Trait-driven'),
    ('My food choices depend on my mood at the moment. (I)', 'Trait-driven'),
    ('I have a routine when it comes to food. (H)', 'Trait-driven'),
    ('I often change my mind about what I want to eat. (I)', 'Trait-driven'),
    ('I stick to my usual food choices even when there are other options. (H)', 'Trait-driven'),
    ('I rarely plan my meals ahead of time. (I)', 'Trait-driven')
) as q(question_text, category_name)
join public.categories c on c.category_name = q.category_name
join public.users u on u.user_name = 'elclemente2@up.edu.ph'
where not exists (
  select 1 from public.questions qq where qq.question_text = q.question_text
);

insert into public.examinees (examinee_name)
values ('Demo User')
on conflict do nothing;
