import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter' // gray-matter 需要作为依赖安装

// Helper function to format date
function formatDate(date) {
  if (!date) return { string: '', time: 0 };
  const d = new Date(date);
  return {
    time: d.getTime(),
    string: d.toLocaleDateString('en-US', { // English date format for consistency in sorting
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    // You can add a locale-specific string here if needed for display later
    // zhString: d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  };
}

// Helper function to get posts from a specific directory and language prefix
function getPosts(baseDir, langPrefix = '') {
  const posts = [];
  const notesDir = path.join(baseDir, langPrefix ? `src/${langPrefix}/Notes` : 'src/Notes');

  try {
    const dirents = fs.readdirSync(notesDir, { withFileTypes: true });

    for (const dirent of dirents) {
      if (dirent.isDirectory()) {
        const subDirPath = path.join(notesDir, dirent.name);
        const subDirFiles = fs.readdirSync(subDirPath);
        for (const file of subDirFiles) {
          if (file.endsWith('.md')) {
            const filePath = path.join(subDirPath, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { data: frontmatter, excerpt } = matter(fileContent, { excerpt_separator: '<!-- more -->' });
            
            const url = `/${langPrefix ? langPrefix + '/' : ''}Notes/${dirent.name}/${file.replace(/\.md$/, '.html')}`;
            
            posts.push({
              url,
              frontmatter: {
                ...frontmatter,
                // Ensure description is available, fallback to excerpt if desc is missing
                desc: frontmatter.desc || excerpt?.trim(), 
              },
              date: formatDate(frontmatter.date),
            });
          }
        }
      } else if (dirent.isFile() && dirent.name.endsWith('.md') && dirent.name !== 'index.md') {
        const filePath = path.join(notesDir, dirent.name);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter, excerpt } = matter(fileContent, { excerpt_separator: '<!-- more -->' });

        const url = `/${langPrefix ? langPrefix + '/' : ''}Notes/${dirent.name.replace(/\.md$/, '.html')}`;

        posts.push({
          url,
          frontmatter: {
            ...frontmatter,
            desc: frontmatter.desc || excerpt?.trim(),
          },
          date: formatDate(frontmatter.date),
        });
      }
    }
  } catch (e) {
    // Directory might not exist, e.g., if no zh/Notes yet
    console.warn(`Could not read directory ${notesDir}: ${e.message}`);
  }
  return posts;
}

export default {
  watch: ['./docs/src/Notes/**/*.md', './docs/src/zh/Notes/**/*.md'],
  load(watchedFiles) {
    const workspaceRoot = path.resolve(); // Gets the root of the workspace
    const docsDir = path.join(workspaceRoot, 'docs');

    let allPosts = [
      ...getPosts(docsDir), // English posts (no langPrefix)
      ...getPosts(docsDir, 'zh') // Chinese posts (langPrefix='zh')
    ];

    // Sort posts by date descending
    allPosts.sort((a, b) => b.date.time - a.date.time);

    // console.log('Loaded posts:', allPosts.map(p => ({url: p.url, title: p.frontmatter.title, date: p.date.string }) ));
    return allPosts;
  }
} 