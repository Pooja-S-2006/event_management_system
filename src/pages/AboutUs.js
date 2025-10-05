import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaYoutube } from 'react-icons/fa';
import styled from 'styled-components';

// Styled Components
const HeroSection = styled.div`
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
              url('https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 100px 0;
  text-align: center;
`;

const VideoCard = styled(Card)`
  margin-bottom: 30px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const VideoThumbnail = styled.div`
  position: relative;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  background: #000;
  cursor: pointer;
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 48px;
    color: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
  }
  
  &:hover .play-button {
    color: #ff0000;
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const VideoActions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
`;

const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: #6c757d;
  padding: 5px 10px;
  
  &:hover {
    color: #ff0000;
    background: rgba(255, 0, 0, 0.05);
  }
  
  &.active {
    color: #ff0000;
  }
`;

const TeamMember = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 15px;
    border: 5px solid #f8f9fa;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

// YouTube video data
const youtubeVideos = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Our Story',
    description: 'Learn about our journey and what drives us to create amazing experiences.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
  },
  {
    id: '9bZkp7q19f0',
    title: 'Behind the Scenes',
    description: 'Take a look at how we bring events to life with passion and creativity.',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg'
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Our Community Impact',
    description: 'See how we make a difference in our community through our events.',
    thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg'
  }
];

const AboutUs = () => {
  const [videoStates, setVideoStates] = useState({});
  const [showVideo, setShowVideo] = useState({});
  const [savedVideos, setSavedVideos] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  // Initialize video states
  useEffect(() => {
    const initialState = {};
    youtubeVideos.forEach(video => {
      initialState[video.id] = {
        liked: false,
        saved: false
      };
    });
    setVideoStates(initialState);
    
    // Load saved videos from localStorage
    const saved = JSON.parse(localStorage.getItem('savedVideos') || '[]');
    setSavedVideos(saved);
    
    // Load team members (in a real app, this would be an API call)
    setTeamMembers([
      {
        id: 1,
        name: 'John Doe',
        role: 'Founder & CEO',
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        bio: 'Passionate about creating memorable experiences that bring people together.'
      },
      {
        id: 2,
        name: 'Jane Smith',
        role: 'Event Director',
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
        bio: 'Dedicated to crafting events that leave a lasting impression.'
      },
      {
        id: 3,
        name: 'Alex Johnson',
        role: 'Creative Director',
        image: 'https://randomuser.me/api/portraits/men/3.jpg',
        bio: 'Bringing innovative ideas to life through creative event design.'
      }
    ]);
  }, []);

  const handleLike = (videoId) => {
    setVideoStates(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        liked: !prev[videoId]?.liked
      }
    }));
    
    // In a real app, you would make an API call here to update the like status
    // axios.post(`${API_BASE_URL}/videos/${videoId}/like`);
  };

  const handleSave = (videoId) => {
    const newSavedVideos = [...savedVideos];
    const videoIndex = newSavedVideos.indexOf(videoId);
    
    if (videoIndex === -1) {
      newSavedVideos.push(videoId);
    } else {
      newSavedVideos.splice(videoIndex, 1);
    }
    
    setSavedVideos(newSavedVideos);
    localStorage.setItem('savedVideos', JSON.stringify(newSavedVideos));
    
    setVideoStates(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        saved: !prev[videoId]?.saved
      }
    }));
    
    // In a real app, you would make an API call here to update the save status
    // axios.post(`${API_BASE_URL}/videos/${videoId}/save`);
  };

  const toggleVideo = (videoId) => {
    setShowVideo(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  return (
    <>
      <HeroSection>
        <Container>
          <h1>About Us</h1>
          <p className="lead">Creating unforgettable experiences through passion and innovation</p>
        </Container>
      </HeroSection>

      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">Our Story</h2>
          <Row className="mb-5">
            <Col md={6}>
              <p className="lead">
                Founded in 2023, our mission has been to create extraordinary events that inspire and connect people. 
                What started as a small team with big dreams has grown into a full-service event management company 
                known for creativity, attention to detail, and exceptional service.
              </p>
              <p>
                We believe that every event tells a story, and we're passionate about helping you tell yours. 
                Whether it's a corporate conference, a dream wedding, or a community festival, we pour our 
                hearts into every detail to ensure your vision becomes a reality.
              </p>
            </Col>
            <Col md={6}>
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80" 
                alt="Our Team" 
                className="img-fluid rounded shadow"
                style={{ width: '100%', height: '350px', objectFit: 'cover' }}
              />
            </Col>
          </Row>

          <h2 className="text-center mb-5">Our Videos</h2>
          <Row>
            {youtubeVideos.map((video) => (
              <Col key={video.id} md={4} className="mb-4">
                <VideoCard>
                  {showVideo[video.id] ? (
                    <div className="embed-responsive embed-responsive-16by9">
                      <iframe
                        className="embed-responsive-item"
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: '100%', height: '200px', border: 'none' }}
                      ></iframe>
                    </div>
                  ) : (
                    <VideoThumbnail onClick={() => toggleVideo(video.id)}>
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                        }}
                      />
                      <div className="play-button">
                        <FaYoutube size={48} />
                      </div>
                    </VideoThumbnail>
                  )}
                  <Card.Body>
                    <Card.Title>{video.title}</Card.Title>
                    <Card.Text>{video.description}</Card.Text>
                  </Card.Body>
                  <VideoActions>
                    <ActionButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(video.id);
                      }}
                      className={videoStates[video.id]?.liked ? 'active' : ''}
                    >
                      {videoStates[video.id]?.liked ? (
                        <FaHeart />
                      ) : (
                        <FaRegHeart />
                      )}
                      <span>Like</span>
                    </ActionButton>
                    <ActionButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(video.id);
                      }}
                      className={savedVideos.includes(video.id) ? 'active' : ''}
                    >
                      {savedVideos.includes(video.id) ? (
                        <FaBookmark />
                      ) : (
                        <FaRegBookmark />
                      )}
                      <span>Save</span>
                    </ActionButton>
                  </VideoActions>
                </VideoCard>
              </Col>
            ))}
          </Row>

          <h2 className="text-center mb-5 mt-5">Meet Our Team</h2>
          <Row className="mb-5">
            {teamMembers.map((member) => (
              <Col key={member.id} md={4}>
                <TeamMember>
                  <img src={member.image} alt={member.name} />
                  <h4>{member.name}</h4>
                  <p className="text-muted">{member.role}</p>
                  <p>{member.bio}</p>
                </TeamMember>
              </Col>
            ))}
          </Row>

          <div className="text-center py-4">
            <h3>Ready to create something amazing together?</h3>
            <Button variant="danger" size="lg" className="mt-3">
              Get in Touch
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
};

export default AboutUs;
