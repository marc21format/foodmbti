# Food MBTI Laravel Reference

This document captures the Laravel-side schema and structure shared for the Food MBTI project so the Next.js app can stay aligned.

## Tables

### categories
- `category_id` (PK)
- `category_name` (string)
- `category_desc` (string, nullable)

### cat_types
- `cat_type_id` (PK)
- `cat_type_name` (string)
- `category_id` (FK -> categories.category_id)

### archetype_personas
- `archetype_persona_id` (PK)
- `archetype_name` (string)
- `archetype_desc` (string, nullable)

### archetype_components
- `archetype_component_id` (PK)
- `cat_type_id` (FK -> cat_types.cat_type_id)
- `archetype_persona_id` (FK -> archetype_personas.archetype_persona_id)

### users
- `user_id` (PK)
- `user_name` (string)
- `user_password` (string)

### questions
- `question_id` (PK)
- `question_text` (string)
- `category_id` (FK -> categories.category_id)
- `user_id` (FK -> users.user_id)

### examinees
- `examinee_id` (PK)
- `examinee_name` (string)

### answers
- `answer_id` (PK)
- `answer_value` (integer)
- `examinee_id` (FK -> examinees.examinee_id)
- `question_id` (FK -> questions.question_id)

## Relationship Summary

- One `category` has many `cat_types`.
- One `category` has many `questions`.
- One `cat_type` has many `archetype_components`.
- One `archetype_persona` has many `archetype_components`.
- One `user` has many `questions`.
- One `question` has many `answers`.
- One `examinee` has many `answers`.

## Laravel CRUD Scope (Reference)

Resource controllers listed:
- categories
- cat_types
- archetype_personas
- archetype_components
- users
- questions
- examinees
- answers

Auth-protected resources and a `tables.index` overview page were included in the reference.

## Notes For Next.js Integration

- Treat IDs as numeric keys from Laravel.
- Soft delete is used in Laravel models/migrations, so APIs may omit deleted records.
- Keep naming compatibility with snake_case API payloads, or map to camelCase in UI adapters.
