---
name: "web-learning-assistant"
description: "Comprehensive web content learning assistant that extracts, structures, and learns from web pages and their sub-pages. Invoke when user provides a URL to learn from, needs to extract knowledge from documentation, or wants to build knowledge base from web sources."
---

# Web Learning Assistant

A comprehensive skill for extracting, structuring, and learning from web content including main pages and sub-pages.

## Overview

This skill combines three core capabilities:
1. **Web Content Extraction** - Automatically scrape web pages and sub-pages
2. **Knowledge Building** - Structure and organize extracted information
3. **Deep Learning** - Analyze complexity and extract key insights

## When to Invoke

- User provides a URL and asks to "learn" or "study" from it
- User wants to extract documentation or tutorial content
- User needs to build knowledge base from multiple web sources
- User asks to understand a framework, library, or technology from its docs

## Workflow

### Step 1: Analyze the URL

First, determine the type of content:
- **Documentation site** (e.g., docs.example.com)
- **Tutorial/Blog post** (e.g., medium.com, dev.to)
- **GitHub repository** (e.g., github.com/user/repo)
- **API reference** (e.g., api.example.com)
- **Video tutorial** (limited support - extract transcript if available)

### Step 2: Extract Main Content

Use WebFetch to get the main page content:
```javascript
// Fetch the primary content
const content = await WebFetch(url);
```

**Content Processing:**
- Remove navigation elements
- Remove advertisements
- Extract main article/documentation body
- Preserve code blocks
- Preserve headings structure

### Step 3: Identify Sub-Pages

Look for links to related content:
- Table of contents links
- "Next/Previous" navigation
- Related articles
- Child documentation pages

### Step 4: Batch Learning Strategy

For large content, use chunked learning:

```
If content > 4000 lines:
  1. Extract table of contents/structure first
  2. Learn section by section
  3. Summarize each section
  4. Build comprehensive summary
```

### Step 5: Knowledge Structuring

Organize extracted content into:

```yaml
knowledge_structure:
  overview: "Brief summary of the content"
  key_concepts: ["List of main concepts"]
  code_examples: ["Important code snippets"]
  configuration: "Setup/config instructions"
  best_practices: "Recommended approaches"
  common_pitfalls: "Things to avoid"
  related_resources: ["Links to related content"]
```

### Step 6: Save to Knowledge Base

Store structured content for future reference:
- Save to `.trae/knowledge/` directory
- Create searchable index
- Tag with relevant keywords
- Link related concepts

## Implementation Guidelines

### For Documentation Sites

1. **Extract navigation structure first**
   - Identify main sections
   - Map sub-pages
   - Note version information

2. **Learn in logical order**
   - Start with "Getting Started"
   - Follow tutorial progression
   - End with advanced topics

3. **Preserve code examples**
   - Extract all code blocks
   - Note programming language
   - Include file paths if mentioned

### For GitHub Repositories

1. **Read README.md first**
   - Project overview
   - Installation instructions
   - Basic usage examples

2. **Explore key files**
   - package.json / requirements.txt
   - Main source files
   - Configuration files
   - Example projects

3. **Check issues and discussions**
   - Common problems
   - Feature requests
   - Community solutions

### For Tutorial Articles

1. **Extract step-by-step instructions**
   - Prerequisites
   - Setup steps
   - Implementation details
   - Testing/verification

2. **Capture all code changes**
   - Before/after comparisons
   - File modifications
   - Command line instructions

3. **Note expected outcomes**
   - Screenshots descriptions
   - Expected behavior
   - Common errors

## Content Extraction Rules

### DO Extract:
- Main article/documentation body
- Code examples and snippets
- Configuration files
- Step-by-step instructions
- Important warnings or notes
- API signatures and parameters
- Version compatibility info

### DO NOT Extract:
- Navigation menus
- Advertisements
- Footer content
- User comments (unless relevant)
- Social media widgets
- Cookie consent banners

## Output Format

After learning from a web source, provide:

```markdown
## Summary
[Brief overview of what was learned]

## Key Concepts
- Concept 1: [Explanation]
- Concept 2: [Explanation]

## Code Examples
\`\`\`language
[Important code snippets]
\`\`\`

## Implementation Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Best Practices
- [Practice 1]
- [Practice 2]

## Common Issues
- [Issue 1]: [Solution]
- [Issue 2]: [Solution]

## Additional Resources
- [Link 1]: [Description]
- [Link 2]: [Description]
```

## Limitations

- Cannot access content behind authentication
- Cannot execute JavaScript (static content only)
- Limited to text content (images described, not analyzed)
- Rate limits may apply for multiple requests
- Very large sites may need manual prioritization

## Example Usage

**User:** "Learn from https://react.dev/learn"

**Assistant Actions:**
1. Fetch main React learning page
2. Identify key tutorial sections
3. Extract code examples
4. Structure concepts (Components, JSX, Props, State)
5. Save to knowledge base
6. Provide comprehensive summary

## Tools to Use

- **WebFetch**: Primary tool for fetching web content
- **File System**: Save structured knowledge
- **Search**: Query existing knowledge base
- **Memory**: Store and retrieve learned concepts
