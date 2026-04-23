# Module 7: Support & Help

**Status:** Core | **Priority:** Medium | **Phase:** 5 (Weeks 17-20)

## Quick Links
- [User Management Module](./M2_USER_MANAGEMENT.md)
- [Compliance Module](./M8_COMPLIANCE.md)
- [Architecture Overview](../ARCHITECTURE.md)

---

## 7.1 Help Center

### Endpoints
```
GET    /help/articles          - List articles
GET    /help/articles/:id      - Get article
GET    /help/categories        - List categories
POST   /help/articles/:id/rate - Rate article
```

### Database
```sql
help_articles (id, title, content, category_id, views, rating)
help_categories (id, name, description)
```

### Article Fields
- Title
- Content (markdown)
- Category
- Tags
- Author
- Published Date
- View Count
- Rating

---

## 7.2 Support Tickets

### Endpoints
```
GET    /support/tickets        - List tickets
POST   /support/tickets        - Create ticket
GET    /support/tickets/:id    - Get ticket
PUT    /support/tickets/:id    - Update ticket
POST   /support/tickets/:id/messages - Add message
```

### Database
```sql
support_tickets (id, organization_id, title, description, status, priority, assigned_to)
ticket_messages (id, ticket_id, user_id, message, created_at)
```

### Ticket Status
- open - New ticket
- in_progress - Being worked on
- waiting - Waiting for customer
- resolved - Resolved
- closed - Closed

### Priority Levels
- low - Can wait
- medium - Normal
- high - Urgent
- critical - Blocking

---

## 7.3 Live Chat

### Endpoints
```
POST   /chat                   - Start chat
GET    /chat/:id               - Get chat
POST   /chat/:id/messages      - Send message
GET    /chat/:id/messages      - Get messages
```

### Database
```sql
chat_conversations (id, organization_id, user_id, started_at, ended_at)
chat_messages (id, conversation_id, user_id, message, timestamp)
```

---

## 7.4 FAQ Section

### Endpoints
```
GET    /faq                    - List FAQs
GET    /faq/:id                - Get FAQ
POST   /faq/:id/helpful        - Mark helpful
```

### Database
```sql
faq_items (id, question, answer, category, helpful_count)
```

---

## 7.5 Community Forum

### Endpoints
```
GET    /forum/threads          - List threads
POST   /forum/threads          - Create thread
GET    /forum/threads/:id      - Get thread
POST   /forum/threads/:id/posts - Add post
```

### Database
```sql
forum_threads (id, title, description, author_id, created_at)
forum_posts (id, thread_id, author_id, content, created_at)
```

---

## Frontend Components

### Pages
- `/help` - Help center
- `/help/articles/:id` - Article view
- `/support/tickets` - Ticket list
- `/support/tickets/:id` - Ticket detail
- `/support/chat` - Live chat
- `/faq` - FAQ section
- `/community/forum` - Community forum

### Components
- `HelpSearch` - Help search
- `ArticleList` - Articles list
- `TicketForm` - Ticket form
- `ChatWidget` - Chat widget
- `ForumThread` - Forum thread

---

## Related Documentation
- [User Management Module](./M2_USER_MANAGEMENT.md)
- [Compliance Module](./M8_COMPLIANCE.md)
- [Architecture Overview](../ARCHITECTURE.md)
