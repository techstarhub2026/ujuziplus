import { getAdminSolutions } from "@/lib/actions/solutions";
import { getAdminBlogPosts } from "@/lib/actions/blog";
import { getAdminPricingPlans } from "@/lib/actions/pricing";
import { getAdminProjects } from "@/lib/actions/projects";
import { AdminContentPanel } from "@/components/admin/AdminContentPanel";
import { decimalToNumber } from "@/lib/serialize";

export default async function AdminContentPage() {
  const [solutions, blogPosts, pricingPlans, projects] = await Promise.all([
    getAdminSolutions(),
    getAdminBlogPosts(),
    getAdminPricingPlans(),
    getAdminProjects(),
  ]);

  return (
    <AdminContentPanel
      solutions={solutions.map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        status: s.status,
        level: s.level,
        author: s.author,
        organization: s.organization,
      }))}
      blogPosts={blogPosts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        status: p.status,
        category: p.category,
      }))}
      pricingPlans={pricingPlans.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: decimalToNumber(p.price),
        isActive: p.isActive,
      }))}
      projects={projects.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        isPublished: p.isPublished,
        creator: p.creator,
      }))}
    />
  );
}
