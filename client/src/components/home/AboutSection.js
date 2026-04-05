import React from 'react';
import { FaLandmark, FaUsers, FaLeaf, FaPalette } from 'react-icons/fa';
import natureCover from '../../assets/Images/Nature Pic.png';

const FeatureCard = ({ Icon, title, description }) => (
  <div className="custom-card p-4">
    <div className="display-5 mb-3 text-success"><Icon /></div>
    <h3 className="fs-4 fw-semibold mb-2">{title}</h3>
    <p className="text-muted">{description}</p>
  </div>
);

const AboutSection = () => {
  const features = [
    {
      Icon: FaLandmark,
      title: 'Rich Heritage',
      description: 'Discover the deep-rooted traditions and cultural heritage of Puriya Thanda.'
    },
    {
      Icon: FaUsers,
      title: 'Unity in Diversity',
      description: 'Experience the strong community bonds and inclusive nature of our village.'
    },
    {
      Icon: FaLeaf,
      title: 'Natural Beauty',
      description: 'Surrounded by pristine nature and scenic landscapes that captivate visitors.'
    },
    {
      Icon: FaPalette,
      title: 'Vibrant Culture',
      description: 'Celebrate our festivals, traditions, and cultural events throughout the year.'
    }
  ];

  return (
    <section className="py-5 bg-light">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mx-auto mb-5" style={{ maxWidth: '800px' }}>
          <h2 className="display-5 fw-bold mb-4">
            About Our Village
          </h2>
          <p className="lead text-muted">
            Located in Bodiya Thanda Panchayat, Kusumanchi Mandal, Khammam District,
            Telangana, our village is a testament to tradition, unity, and progress.
          </p>
        </div>

        {/* Features Grid */}
        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>

        {/* Village Story */}
        <div className="mt-5">
          <div className="custom-card overflow-hidden">
            <div className="row g-0">
              <div className="col-md-6">
                <img
                  src={natureCover}
                  alt="Village Life"
                  className="img-fluid h-100 object-fit-cover"
                />
              </div>
              <div className="col-md-6 p-4 p-md-5">
                <h3 className="display-6 fw-bold mb-4">
                  Our Story
                </h3>
                <div className="text-muted">
                  <p className="mb-4">
                    Puriya Thanda has a rich history dating back generations. Our
                    village has grown from humble beginnings into a vibrant
                    community that preserves its cultural heritage while embracing
                    progress.
                  </p>
                  <p className="mb-4">
                    The village is known for its strong sense of unity, where
                    residents come together to celebrate festivals, support each
                    other, and maintain our traditions.
                  </p>
                  <p>
                    Today, we continue to grow and develop while maintaining our
                    core values and the beautiful balance between tradition and
                    modernity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-5">
          <button className="btn btn-custom-primary btn-lg">
            Learn More About Our Village
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection; 