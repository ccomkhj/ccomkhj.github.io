---

layout: single  
author: Huijo  
date: 2025-06-14
tags:  
   - Math
classes: wide  
title: "How to Set Up a Custom Domain on GitHub Pages with Namecheap"  

---

Today, I went through the process of connecting my custom domain, `huijo.xyz`, to my GitHub Pages site. It's a common task for developers looking to personalize their web presence. Here’s a step-by-step guide on how I did it, specifically for a domain registered with Namecheap.

### The Goal

The objective is to make my GitHub Pages site, originally hosted at `ccomkhj.github.io`, accessible through my custom domain `huijo.xyz`.

### Step 1: Configure Your GitHub Repository

The first step is to tell GitHub which custom domain you want to use. This is done by adding a `CNAME` file to your repository.

1.  **Create the `CNAME` file:** In the root directory of your GitHub Pages repository, create a file named `CNAME`.
2.  **Add your domain:** The file should contain a single line: the name of your custom domain. In my case, it was:
    ```
    huijo.xyz
    ```
3.  **Commit and Push:** Add the file to git, commit it, and push the changes to your repository.

    ```bash
    git add CNAME
    git commit -m "feat: Add CNAME for custom domain"
    git push
    ```

### Step 2: Configure DNS Records on Namecheap

Next, you need to configure your domain's DNS records to point to GitHub's servers.

1.  **Log in to Namecheap** and navigate to the "Advanced DNS" tab for your domain.
2.  **Add `A` Records for the Apex Domain:** You need to create four separate `A` records that point your main domain (represented by `@`) to GitHub's IP addresses.

    | Type     | Host | Value           |
    |----------|------|-----------------|
    | A Record | @    | 185.199.108.153 |
    | A Record | @    | 185.199.109.153 |
    | A Record | @    | 185.199.110.153 |
    | A Record | @    | 185.199.111.153 |

3.  **Add a `CNAME` Record for the `www` Subdomain:** To ensure `www.huijo.xyz` also works, you need to add a `CNAME` record that points `www` to your original GitHub Pages address.

    | Type         | Host | Value               |
    |--------------|------|---------------------|
    | CNAME Record | www  | ccomkhj.github.io   |

### Step 3: Wait for DNS Propagation

This is the part that requires patience. After saving the DNS records, it takes time for the changes to spread across the internet. This is called DNS propagation.

- It can take anywhere from a few minutes to a few hours.
- During this time, the GitHub repository settings might show a "DNS check unsuccessful" error. This is normal.

Once propagation is complete, the error will disappear, and GitHub will automatically secure the site with an SSL certificate. Now, my site is successfully served from `huijo.xyz`!
