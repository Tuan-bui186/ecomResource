import React from 'react';
import { useEffect, useState } from 'react';
import { getAllComment, deleteCommentServiceById } from '../../../services/userService';
import moment from 'moment';
import { toast } from 'react-toastify';
import { PAGINATION } from '../../../utils/constant';
import ReactPaginate from 'react-paginate';
import CommonUtils from '../../../utils/CommonUtils';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";

const ManageComment = () => {
  
    const [dataComment, setdataComment] = useState([])
    const [count, setCount] = useState('')
    const [numberPage, setnumberPage] = useState('')
    useEffect(() => {
        try {
           
            fetchData();
        } catch (error) {
            console.log(error)
        }

    }, [])
    let fetchData = async () => {
        let arrData = await getAllComment({

           
            limit: PAGINATION.pagerow,
            offset: 0,
           

        })
        if (arrData && arrData.errCode === 0) {
            setdataComment(arrData.data)
            setCount(Math.ceil(arrData.count / PAGINATION.pagerow))
        }
    }
    let handleBanComment = async (event, id) => {
        event.preventDefault();
        console.log(id)
        let res = await deleteCommentServiceById(id)
        if (res && res.errCode === 0) {
            toast.success("Xóa bình luận thành công")
            let arrData = await getAllComment({
                limit: PAGINATION.pagerow,
                offset: numberPage * PAGINATION.pagerow
            })
            if (arrData && arrData.errCode === 0) {

                setdataComment(arrData.data);
                setCount(Math.ceil(arrData.count / PAGINATION.pagerow))
            }
        } else {
            toast.error("Xóa bình luận thất bại")
        }
    }
    let handleChangePage = async (number) => {
        setnumberPage(number.selected)
        let arrData = await getAllComment({

          
            limit: PAGINATION.pagerow,
            offset: number.selected * PAGINATION.pagerow,
            

        })
        if (arrData && arrData.errCode === 0) {
            setdataComment(arrData.data)

        }
    }
    
    let handleOnClickExport =async () =>{
        let res = await getAllComment({
            limit: '',
            offset: '',
           
        })
        if(res && res.errCode == 0){
            await CommonUtils.exportExcel(res.data,"Danh sách đánh giá","ListComment")
        }
       
    }
    return (
        <div className="container-fluid px-4">
            <h1 className="mt-4">Quản lý đánh giá</h1>


            <div className="card mb-4">
                <div className="card-header">
                    <i className="fas fa-table me-1" />
                    Danh sách đánh giá
                </div>
                <div className="card-body">
               
                    <div className='row'>
                   
                    <div className='col-12'>
                    <button  style={{float:'right'}} onClick={() => handleOnClickExport()} className="btn btn-success mb-2" >Xuất excel <i class="fa-solid fa-file-excel"></i></button>
                    </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-bordered" style={{ border: '1' }} width="100%" cellspacing="0">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Ngày đánh giá</th>
                                    <th>Tên người đánh giá</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Tên blog</th>
                                    <th>Nội dung</th>
                                    <th>Số sao</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {dataComment && dataComment.length > 0 &&
                                    dataComment.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{moment.utc(item.createdAt).local().format('DD/MM/YYYY HH:mm:ss')}</td>
                                                <td>{item.user.firstName + " " + item.user.lastName}</td>
                                                <td>{item.product ? item.product.name: ''}</td>
                                                <td>{item.blog ? item.blog.title: ''}</td>
                                                <td>{item.content}</td>    
                                                <td>{item.star}</td>
                                              
                                                <td>
                                                    <a href="#" onClick={(event) => handleBanComment(event, item.id)} >Delete</a>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }


                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <ReactPaginate
                previousLabel={'Quay lại'}
                nextLabel={'Tiếp'}
                breakLabel={'...'}
                pageCount={count}
                marginPagesDisplayed={3}
                containerClassName={"pagination justify-content-center"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                breakLinkClassName={"page-link"}
                breakClassName={"page-item"}
                activeClassName={"active"}
                onPageChange={handleChangePage}
            />
        </div>
    )
}
export default ManageComment;