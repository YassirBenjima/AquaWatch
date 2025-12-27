import React from 'react';

import { ArrowLeft, Droplets, Sun, Activity, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewsCard = ({ date, title, description, source, icon: Icon, image }) => (
    <div className="glass-panel overflow-hidden hover:translate-y-[-4px] transition-all duration-300 group">
        {/* Image Section */}
        <div className="h-48 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-bg-darker/80 to-transparent z-10" />
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-medium text-white/90 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                    {source}
                </span>
            </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-secondary bg-white/5 px-2 py-1 rounded full border border-white/10">
                    {date}
                </span>
            </div>

            <h3 className="text-lg font-bold mb-2 text-text-primary leading-tight group-hover:text-primary transition-colors">
                {title}
            </h3>
            <p className="text-secondary text-sm leading-relaxed line-clamp-3">
                {description}
            </p>
        </div>
    </div>
);

const News = () => {
    const newsItems = [
        {
            date: 'Dec 2025',
            title: 'Desalination Megaproject in Casablanca',
            description: 'Morocco accelerates the construction of the Casablanca desalination plant, aiming to secure drinking water for the region by 2030 using renewable energy sources.',
            source: 'Infrastructure',
            icon: Droplets,
            image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=800'
        },
        {
            date: 'Nov 2025',
            title: 'Drought Impact on Agriculture',
            description: 'Persistent drought conditions continue to challenge the agricultural sector. New restrictions on irrigation are being enforced in the Oum Er-Rbia basin.',
            source: 'Climate Alert',
            icon: Sun,
            image: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=800'
        },
        {
            date: 'Oct 2025',
            title: 'Water Highway Expansion',
            description: 'The "Water Highway" project connecting the Sebou and Bouregreg basins has successfully transferred millions of cubic meters, securing water supply for Rabat and Casablanca.',
            source: 'National Strategy',
            icon: Activity,
            image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800'
        },
        {
            date: 'Sep 2025',
            title: 'Groundwater Preservation Laws',
            description: 'New strict regulations have been passed to combat illicit well drilling and preserve deep aquifers across the Souss-Massa region.',
            source: 'Policy',
            icon: Activity,
            image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=800'
        }
    ];

    return (
        <div className="h-screen relative bg-bg-darker text-text-primary p-6 md:p-12 overflow-y-auto">
            {/* Background Elements */}
            <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/5"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <div>
                            <h1 className="text-4xl font-bold text-text-primary">
                                Water News
                            </h1>
                            <p className="text-secondary mt-1">Updates on Morocco's Water Situation</p>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {newsItems.map((item, index) => (
                        <NewsCard key={index} {...item} />
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-900/20 to-transparent border border-blue-500/10">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <ExternalLink className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-blue-100">Did you know?</h4>
                            <p className="text-blue-200/70 mt-1 text-sm max-w-2xl">
                                Morocco plans to build 155 new large dams by 2027 to increase water storage capacity to 27 billion cubic meters.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default News;
