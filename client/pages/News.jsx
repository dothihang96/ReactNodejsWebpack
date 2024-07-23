import React, { useState, useEffect } from 'react';
import { Table, Input, Button } from 'antd';
import { useQuery } from 'react-apollo';
import { GET_NEWS } from '../graphql/news';

const News = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newsList, setNewsList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [getnews ] = useQuery(GET_NEWS);

  const handleSearch = async (page = 1) => {
    try {
      const input = {
        search: searchQuery,
        page: page,
        limit: pagination.pageSize
      };
      getnews({variables: {input}})
        .then(async ({data}) => {
        setNewsList(data.news);
        setPagination({
          ...pagination,
          current: page,
          total: data.total,
        });
      })
      // const response = await fetch(`http://localhost:8081/api/news/get?search=${searchQuery}&page=${page}&limit=${pagination.pageSize}`);
      // const data = await response.json();
      // setNewsList(data.news);
      // setPagination({
      //   ...pagination,
      //   current: page,
      //   total: data.total,
      // });
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">Read more</a>,
    },
    {
      title: 'Published At',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Source ID',
      dataIndex: 'sourceId',
      key: 'sourceId',
    },
  ];

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div>
      <h1>News List</h1>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Input
          type="text"
          placeholder="Search news title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={() => handleSearch(1)} style={{ marginLeft: '10px' }}>Search</Button>
      </div>
      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <Table
          dataSource={newsList}
          columns={columns}
          pagination={pagination}
          onChange={(page) => handleSearch(page.current)}
        />
      </div>
    </div>
  );
};

export default News;
