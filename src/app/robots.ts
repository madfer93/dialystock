import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/superadmin/', '/api/'],
        },
        sitemap: 'https://dialystock.vercel.app/sitemap.xml',
    }
}
