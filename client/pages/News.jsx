import React, { useRef, useState ,useEffect} from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table } from 'antd';
import Highlighter from 'react-highlight-words';
import { useLazyQuery} from 'react-apollo';
import { GET_NEWS } from '../graphql/news';
import _ from 'lodash';
import {
  timeStampFormat,
} from '../operator/utils';

const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [getnews,{data}] = useLazyQuery(GET_NEWS);
  const [searchText, setSearchText] = useState(null);
  const [searchedColumn, setSearchedColumn] = useState(null);
  const searchInput = useRef(null);
  const handleSearch = (page = 1) => {
    try {
      const newQuery = {
        page: page,
        limit: pagination.pageSize
      }
      if(!_.isNil(searchedColumn) && !_.isNil(searchText)){
        Object.assign(newQuery, { [searchedColumn] : searchText });
      }
      setCurrentPage(page);
      getnews({variables: {
        input: newQuery
      }})
      console.log('data: ',data);
    }catch (error) {
      console.error('Error fetching news:', error);
    }
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys,clearFilters }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : [])
            setSearchText(e.target.value);
            setSearchedColumn(dataIndex);
          }}
          onPressEnter={() => handleSearch(1)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(1)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      //width: '15%',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      //width: '15%',
      ...getColumnSearchProps('author'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      //width: '25%',
      ...getColumnSearchProps('description'),
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
      render: (value) => timeStampFormat(value)
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      ...getColumnSearchProps('content'),
    },
  ];
  useEffect(() => {
    handleSearch(currentPage);
    if(data){
      setNewsList(data.getNews.news);
      setPagination({
        ...pagination,
        current: currentPage,
        total: data.getNews.total,
      })
    }
  }, [data]);
  return <div style={{ overflowX: 'auto', marginTop: '20px' }}>
    <Table rowKey={(item) => _.get(item, '_id')}
                columns={columns} 
                dataSource={newsList} 
                pagination={pagination}
                onChange={(page) => handleSearch(page.current)}
          />;
  </div>
};
export default News;