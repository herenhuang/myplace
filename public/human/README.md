# Human Test Assets

This directory contains images used in the Human Assessment Test.

## Required Images

### `abstract-1.png`
Used in Step 5 (image description question)
- Recommended: Abstract art or ambiguous visual that can be interpreted multiple ways
- Size: 800x600px or similar aspect ratio
- Format: PNG or JPG
- Purpose: Tests subjective interpretation vs. literal description

## Adding Images

To add the required image:

1. Find or create an abstract/ambiguous image
2. Save it as `abstract-1.png` in this directory
3. The image will automatically be displayed in question 5

## Future Images

You can add more images for additional questions by:

1. Adding image file to this directory (e.g., `abstract-2.png`)
2. Updating the question in `/src/lib/human-questions.ts`:
   ```typescript
   {
     stepNumber: X,
     type: 'image-description',
     question: "Describe this image",
     imageUrl: '/human/abstract-2.png',
     characterLimit: 150
   }
   ```

## Image Guidelines

For best results, use images that:
- Are ambiguous or abstract (multiple valid interpretations)
- Contain emotional content (humans describe feelings, AI describes objects)
- Have unusual perspectives or compositions
- Include subtle details that reward close attention
- Avoid text or obvious subjects

## Examples of Good Images

- Abstract paintings (Kandinsky, Pollock)
- Surreal photography
- Unusual angles of common objects
- Ambiguous optical illusions
- Nature patterns (clouds, water, rocks)
- Minimalist compositions

These types of images help differentiate human responses (emotional, interpretive, creative) from AI responses (literal, descriptive, technical).

