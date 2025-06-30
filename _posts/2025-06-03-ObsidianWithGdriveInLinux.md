---

layout: single  
author: Huijo  
date: 2025-06-03
tags:  
   - Programing
classes: wide  
title: "How to Use Obsidian using Gdrive as Valut in Linux"  

---

To use obsidian across multi platform and multi device without using subscription, G-Drive is a good solution as DB.


## The Problem
1. Google Drive does not offer the official support on G-Drive desktop
2. Linux supports Online Accounts, however it does not "download" files. So, Obsidian can't sync
3. **rclone** is the solution, but it requires many challenges in setup. 

I want to share the relevant materials, so you don't have to repeat the pain I have been through.

## Solution
It'll take less than 5 mins.

1. Set up rclone: Follow this [youtube](https://www.youtube.com/watch?v=YDF1nBaAptw). It explains very clearly. (I used Ubuntu22 as of 2025-6-3, and it worked!)
2. Note: When you extract **root_folder_id** gdrive, ignore the query parameter
 `1-D9HfFkfXdjcrhy9O6V3OulY234232fnz?ths=true` -> only use `1-D9HfFkfXdjcrhy9O6V3OulY234232fnz`
3. You mount your local directory into rclone object!
4. `cd your_local_path`
5. Type below to rclone

```bash
rclone sync obsidian: ./Obsidian
```

assuming, the remote project is `obsidian` and your local directory path is `./Obsidian`

To check your remote project, type below
```bash
rclone listremotes
   demo:
   obsidian:
```