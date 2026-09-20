import { BlogPost } from "@/types/blog";

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "bl-1",
    slug: "getting-started-blender-first-3d-scene",
    title: "Getting Started with Blender: Your First 3D Scene",
    category: "3D Modeling",
    excerpt:
      "A step-by-step guide to creating your first 3D scene in Blender — from navigating the interface to placing primitives and lighting your first shot.",
    content: `Blender is one of the most powerful 3D tools available today — and it's free. Whether you want to model characters, build environments, or produce short animations, Blender has you covered.

In this post, we'll walk through your very first scene:

1. **Install and configure Blender** — Download Blender from the official site, launch it, and familiarize yourself with the layout: the 3D viewport, the Outliner, the Properties editor, and the timeline.

2. **Navigate the viewport** — Learn orbit, pan, and zoom shortcuts. Understanding navigation is 80% of feeling comfortable in Blender.

3. **Add your first primitives** — A cube, a light, and a camera. Move, scale, and rotate them using the transform tools (G, S, R) and the numeric keyboard shortcuts.

4. **Light your scene** — Add a sun light or area light, position it to cast dramatic shadows, and understand the difference between soft and harsh lighting.

5. **Render the first frame** — Switch to the Eevee render engine for fast previews, set your output resolution, and hit Render. Celebrate your first rendered image.

Once your first scene is rendered, you have the foundation to explore modeling, sculpting, texturing, and animation — all within the same project.`,
    author: "Anmolofficial Team",
    publishedAt: "2026-08-15",
    readTime: "6 min read",
  },
  {
    id: "bl-2",
    slug: "art-of-rigor-bringing-characters-to-life",
    title: "The Art of Rigging: Bringing Characters to Life",
    category: "Rigging",
    excerpt:
      "Learn the fundamentals of character rigging — bone hierarchies, IK/FK switching, and how rigs drive every nuance of animation.",
    content: `A character without a rig is just a sculpture — beautiful, but motionless. Rigging is the invisible skeleton and muscle system that lets animators bring a model to life.

This post covers the core rigging concepts every beginner should know:

1. **Bone hierarchies** — Bones are organized in parent-child relationships. A shoulder bone rotates the entire arm, while the elbow bone only affects the lower arm. Understanding this hierarchy is the key to clean deformation.

2. **Forward Kinematics (FK) vs Inverse Kinematics (IK)** — FK means you rotate joints one at a time (shoulder → elbow → wrist). IK lets you grab the hand and the chain follows automatically. Both are essential — most rigs switch between them.

3. **Constraints and control curves** — Professional rigs use control curves (often shaped like arrows or circles) so animators can move characters intuitively without touching the skeleton directly.

4. **Weight painting** — This is how tightly the mesh sticks to each bone. Spend time here: a well-painted rig deforms smoothly, while a poorly painted one looks broken.

5. **Test with simple animations** — Before you animate a film, test your rig with a walk cycle or a simple smile. If those work, your rig is ready for production.

Good rigging is invisible — when the rig works, the audience forgets it's there and feels only the character.`,
    author: "Anmolofficial Team",
    publishedAt: "2026-08-22",
    readTime: "7 min read",
  },
  {
    id: "bl-3",
    slug: "vfx-compositing-combining-layers-pro",
    title: "VFX Compositing 101: Combining Layers Like a Pro",
    category: "VFX",
    excerpt:
      "An introduction to compositing techniques for combining CGI with live-action footage — from green screen to mattes and color grading.",
    content: `Compositing is where all the pieces of a VFX shot come together. A great 3D model or simulation still needs compositing to feel like part of the real world.

Here are the essential compositing techniques every VFX artist should know:

1. **Green screen (chroma key)** — The simplest way to isolate a subject. Light the green backdrop evenly, shoot the subject, then use a keyer (in Nuke, After Effects, or DaVinci Resolve) to remove the green and reveal the background plate.

2. **Matte extraction** — When green isn't possible, extract mattes from luminance, depth, or object IDs. Each matte defines which pixels belong to which layer.

3. **Integration lighting** — Match the color, direction, and intensity of light in your CGI to the live-action plate. Add realistic shadows and reflections where CGI meets the real world.

4. **Color grading and matching** — Every camera and render engine has a different color science. Grade your CGI to match the plate's white balance, contrast curve, and film grain.

5. **Edge treatment** — Real cameras have depth-of-field, motion blur, and slight chromatic aberration. Add these to CGI edges so they don't pop out as too sharp or clean.

Compositing is the art of making the impossible look ordinary — when done well, nobody notices the VFX at all.`,
    author: "Anmolofficial Team",
    publishedAt: "2026-09-01",
    readTime: "8 min read",
  },
  {
    id: "bl-4",
    slug: "motion-design-principles-animations-pop",
    title: "Motion Design Secrets: Principles That Make Animations Pop",
    category: "Animation",
    excerpt:
      "Explore key principles like squash and stretch, timing, and anticipation that separate amateur animations from professional motion design.",
    content: `Why do Disney animations feel alive while many beginner animations feel flat? The answer lies in a handful of foundational principles that have survived decades of filmmaking:

1. **Squash and stretch** — Objects deform when they move fast or hit something. A bouncing ball flattens when it hits the ground and stretches when it springs up. This illusion of flexibility is the cornerstone of animation.

2. **Anticipation** — Before a big action, the body winds up first. A character punches after pulling their arm back. Without anticipation, actions feel sudden and weak.

3. **Staging** — One clear action per shot at a time. If everything moves at once, the audience doesn't know where to look. Use composition and timing to lead the eye.

4. **Timing and spacing** — Two frames can tell completely different stories. Fast spacing feels energetic; slow spacing feels heavy or thoughtful. Master timing and you master emotion.

5. **Arcs** — Almost no motion in nature is a straight line. Arms, legs, tails, and cameras travel along arcs. Refine your animation curves to follow natural arcs for a polished feel.

These principles apply to motion graphics as much as to character animation — every title sequence, app animation, and explainer video benefits from them.`,
    author: "Anmolofficial Team",
    publishedAt: "2026-09-08",
    readTime: "6 min read",
  },
  {
    id: "bl-5",
    slug: "storyboard-to-screen-animation-pipeline",
    title: "From Storyboard to Screen: The Animation Pipeline Explained",
    category: "Animation",
    excerpt:
      "Walk through the full animation production pipeline — pre-production, storyboarding, layout, animation, and post-production.",
    content: `A finished animation is the result of dozens of people working through a carefully orchestrated pipeline. Understanding this pipeline is essential for any creative professional.

**Pre-production**
Before a single frame is animated, the creative vision is locked down: script, concept art, mood boards, and the storyboard — a comic-book-style sequence of every shot in the project.

**Storyboarding**
Each scene is broken into individual shots, sketched with composition, camera movement, and character positions. Storyboards reveal pacing problems and camera issues before expensive animation begins.

**Layout**
In layout, 3D environments are built, cameras are positioned, and characters are blocked into scenes roughly. This is where the director finalizes staging.

**Animation**
Animators bring characters to life shot by shot, applying the principles of motion design and rig performance. This is the most expensive phase of production.

**Post-production**
VFX shots are composited, lighting and color are refined, sound design is layered in, music is mixed, and the final render is output.

Every phase feeds the next; skipping or rushing any stage shows in the final product.`,
    author: "Anmolofficial Team",
    publishedAt: "2026-09-15",
    readTime: "9 min read",
  },
  {
    id: "bl-6",
    slug: "career-paths-vfx-first-industry-job",
    title: "Career Paths in VFX: How to Land Your First Industry Job",
    category: "Career",
    excerpt:
      "Insights from working VFX artists on building a demo reel, networking, and landing your first job in film, TV, or gaming VFX.",
    content: `Breaking into the VFX industry is competitive, but a focused approach can get you there faster than you expect.

**Build a focused demo reel**
VFX studios hire specialists, not generalists. Your reel should showcase deep work in one discipline — compositing, lighting, FX, modeling, or rigging — rather than a scatter of weak work across many.

**Showcase process, not just results**
Studios love seeing how you solved problems. Before each shot, briefly show the raw plate, your approach, and the final result.

**Network where artists gather**
Attend studio open days, VFX festivals, and online communities. Many jobs are filled through referrals before they ever reach job boards.

**Apply broadly at first**
Junior roles are scarce. Apply to smaller studios in addition to the big names — you'll often touch more of the pipeline early on, which builds experience faster.

**Keep learning**
Software updates constantly, and new techniques appear every year. The artists who stay curious keep working.

Your first job isn't the finish line — it's where your craft really begins.`,
    author: "Anmolofficial Team",
    publishedAt: "2026-09-22",
    readTime: "7 min read",
  },
];
