import React from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  PieChartOutlined,
  FileTextOutlined,
  BarChartOutlined,
  MessageOutlined,
  ApartmentOutlined,
  RocketOutlined,
  GlobalOutlined,
  ClusterOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const menuItems = [
  { key: 'overview', icon: <PieChartOutlined />, label: 'Insights Overview' },
  { key: 'insights', icon: <BarChartOutlined />, label: 'Top Picks' },
  { key: 'market', icon: <PieChartOutlined />, label: 'Market Data' },
  { key: 'news', icon: <FileTextOutlined />, label: 'News' },
  { key: 'sec', icon: <BarChartOutlined />, label: 'SEC Filings' },
  { key: 'sentiment', icon: <MessageOutlined />, label: 'Social Sentiment' },
  { key: 'macro', icon: <GlobalOutlined />, label: 'Macro' },
  { key: 'events', icon: <ApartmentOutlined />, label: 'Company Events' },
  { key: 'startup', icon: <RocketOutlined />, label: 'Startup Signals' },
  { key: 'nlp', icon: <ClusterOutlined />, label: 'NLP Extraction' },
];

export default function DashboardLayout({ selectedKey, onMenuChange, children }) {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="60" style={{ background: '#fff' }}>
        <div style={{ height: 48, margin: 16, fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>
          <span role="img" aria-label="logo">📈</span> TrendAgent
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => onMenuChange(key)}
          items={menuItems}
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0, fontSize: 22, fontWeight: 600, textAlign: 'center' }}>
          Market Trend Multi-Agent Dashboard
        </Header>
        <Content style={{ margin: '24px 16px 0', background: colorBgContainer, minHeight: 360 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
