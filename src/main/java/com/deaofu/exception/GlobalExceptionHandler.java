package com.deaofu.exception;

import com.deaofu.common.BaseResponse;
import com.deaofu.common.ErrorCode;
import com.deaofu.common.ResultUtils;
import lombok.extern.slf4j.Slf4j;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 *
 * @author kjq
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 处理请求体 Bean Validation 校验失败。
     *
     * @param e 参数校验异常
     * @return 统一参数错误响应
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public BaseResponse<?> methodArgumentNotValidHandler(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().isEmpty()
                ? ErrorCode.PARAMS_ERROR.getMessage()
                : e.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        return ResultUtils.error(ErrorCode.PARAMS_ERROR, message);
    }

    /**
     * 处理查询参数校验失败。
     *
     * @param e 约束校验异常
     * @return 统一参数错误响应
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public BaseResponse<?> constraintViolationHandler(ConstraintViolationException e) {
        return ResultUtils.error(ErrorCode.PARAMS_ERROR, e.getMessage());
    }

    /**
     * 处理请求JSON格式错误。
     *
     * @param e 请求体读取异常
     * @return 统一参数错误响应
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public BaseResponse<?> messageNotReadableHandler(HttpMessageNotReadableException e) {
        return ResultUtils.error(ErrorCode.PARAMS_ERROR, "请求JSON格式不正确");
    }

    @ExceptionHandler(BusinessException.class)
    public BaseResponse<?> businessExceptionHandler(BusinessException e) {
        log.warn(e.getMessage());
        return ResultUtils.error(e.getErrorCode(), e.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public BaseResponse<?> runtimeExceptionHandler(RuntimeException e) {
        log.error(e.getMessage(), e);
        return ResultUtils.error(ErrorCode.OPERATION_ERROR, e.getMessage());
    }
}
