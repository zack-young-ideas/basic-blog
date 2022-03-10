exports.BlogPostForm = class {
  constructor(args) {
    this.title = args.title;
    this.slug = args.slug;
    this.tags = args.tags.split(',');
    this.body = args.content;
    this.action = args.action;
    this.isValid = this.isValid.bind(this);
  }

  isValid() {
    switch (this.action) {
      case 'Publish':
        return true;
      default:
        this.error = 'Invalid action given';
        return false;
    }
  }
};
