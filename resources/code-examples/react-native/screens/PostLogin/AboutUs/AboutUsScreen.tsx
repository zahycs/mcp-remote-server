import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import axiosRequest from '../../../helper/axiosRequest';
import { API } from '../../../helper/config';
import { WebView } from 'react-native-webview';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { styles } from './Styles';

const AboutUsScreen = () => {
  const [aboutUsContent, setAboutUsContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getAboutUs();
  }, []);

  const cleanHtml = (html: string) => {
    // Extract content between <body> tags if present
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let content = bodyMatch ? bodyMatch[1] : html;

    // Remove scripts, links, and styles
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<link[^>]*>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove WordPress specific comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    
    // Clean up image tags
    content = content.replace(/loading="lazy"\s/g, '');
    content = content.replace(/decoding="async"\s/g, '');
    content = content.replace(/\sonerror="[^"]*"/g, '');

    return content;
  };

  const getAboutUs = async () => {
    setIsLoading(true);
    try {
      const response = await axiosRequest.post(
        `${API.ENDPOINTS.MOBILEAPI}/${API.ENDPOINTS.GET_ABOUTUS}`,
        {},
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('About Us API Response:', response);
      if (response?.data?.aboutus_content) {
        const cleanContent = cleanHtml(response.data.aboutus_content);
        const content = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
              <style>
                * {
                  box-sizing: border-box;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  padding: 16px;
                  margin: 0;
                  color: #333;
                  font-size: 16px;
                  line-height: 1.5;
                  background-color: #ffffff;
                }
                img {
                  max-width: 100%;
                  height: auto;
                  display: block;
                  margin: 16px auto;
                  border-radius: 8px;
                }
                h2, h3 {
                  color: #000;
                  margin: 24px 0 16px 0;
                  text-align: center;
                  font-weight: bold;
                }
                h2 {
                  font-size: 24px;
                }
                h3 {
                  font-size: 20px;
                }
                h4 {
                  font-size: 16px;
                  color: #666;
                  margin: 8px 0 24px 0;
                  text-align: center;
                  font-weight: normal;
                }
                p {
                  margin: 16px 0;
                  color: #333;
                }
                .team-member {
                  text-align: center;
                  margin-bottom: 32px;
                }
              </style>
            </head>
            <body>
              <div class="content">
                ${cleanContent}
              </div>
            </body>
          </html>
        `;
        console.log('Final HTML:', content);
        setAboutUsContent(content);
      }
    } catch (error: any) {
      console.error('Error getting about us content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>

      <View style={styles.webViewContainer}>
        {aboutUsContent ? (
          <WebView
            source={{ html: aboutUsContent }}
            style={styles.webView}
            originWhitelist={['*']}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
            startInLoadingState={true}
            renderLoading={() => <LoadingSpinner />}
            showsVerticalScrollIndicator={true}
            bounces={true}
            automaticallyAdjustContentInsets={true}
            injectedJavaScript={`
              true; // Required by iOS
            `}
          />
        ) : (
          <Text style={styles.noContent}>No content available</Text>
        )}
      </View>
    </View>
  );
};

export default AboutUsScreen;
