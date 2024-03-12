export const generateSlug = (title: string): string => {
	const slug = title.toLowerCase().replace(/\s+/g, '-');
	return slug.replace(/[^\w-]/g, '');
};
