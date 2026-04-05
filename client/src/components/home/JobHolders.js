import React from 'react';

const JobHolders = () => {
  const jobHolders = [
    {
      name: 'Example Name 1',
      designation: 'Software Engineer',
      company: 'Tech Company',
      education: 'B.Tech in Computer Science',
      image: '/assets/Images/jobholders/default.png'
    },
    {
      name: 'Example Name 2',
      designation: 'Teacher',
      company: 'Government School',
      education: 'M.A. in Education',
      image: '/assets/Images/jobholders/default.png'
    },
    {
      name: 'Example Name 3',
      designation: 'Doctor',
      company: 'District Hospital',
      education: 'MBBS, MD',
      image: '/assets/Images/jobholders/default.png'
    }
  ];

  return (
    <section className="job-holders-section py-5 bg-light">
      <div className="container">
        <h2 className="text-center display-5 fw-bold mb-5 text-primary-dark">
          Our Pride - Job Holders
        </h2>
        <div className="row g-4">
          {jobHolders.map((person, index) => (
            <div key={index} className="col-lg-4 col-md-6">
              <div className="job-holder-card">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <img
                      src={process.env.PUBLIC_URL + person.image}
                      alt={person.name}
                      className="job-holder-image mb-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = process.env.PUBLIC_URL + '/assets/Images/default-avatar.png';
                      }}
                    />
                    <h3 className="fs-4 fw-bold text-primary-dark">{person.name}</h3>
                    <p className="text-accent fw-semibold mb-2">{person.designation}</p>
                    <p className="text-muted mb-0">{person.company}</p>
                  </div>
                  <div className="education-info text-center">
                    <h4 className="fs-6 fw-semibold mb-2">Education</h4>
                    <p className="text-muted mb-0">{person.education}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JobHolders; 