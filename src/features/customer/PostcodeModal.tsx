import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface PostcodeModalProps {
  onComplete: (data: { zonecode: string; address: string }) => void;
  onClose: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: white;
  width: 500px;
  height: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
`;

const PostcodeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

declare global {
  interface Window {
    daum: {
      Postcode: new (config: any) => {
        embed: (element: HTMLElement) => void;
      };
    };
  }
}

const PostcodeModal: React.FC<PostcodeModalProps> = ({ onComplete, onClose }) => {
  const postcodeInstance = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.daum && !postcodeInstance.current) {
        postcodeInstance.current = new window.daum.Postcode({
          oncomplete: (data: any) => {
            onComplete({
              zonecode: data.zonecode,
              address: data.address
            });
            onClose();
          },
          width: '100%',
          height: '100%',
          animation: true,
          hideMapBtn: true,
          hideEngBtn: true,
          pleaseReadGuide: 0
        });
        postcodeInstance.current.embed(document.getElementById('postcode-container') as HTMLElement);
      }
    };

    return () => {
      document.body.removeChild(script);
      postcodeInstance.current = null;
    };
  }, [onComplete, onClose]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <PostcodeContainer id="postcode-container" />
      </ModalContent>
    </ModalOverlay>
  );
};

export default PostcodeModal; 