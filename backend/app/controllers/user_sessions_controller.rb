class UserSessionsController < ApplicationController
  def create
    @user_session = UserSession.new(params[:user_session])
    if @user_session.save
      render :nothing => true, :status => 200
    else
      render :nothing => true, :status => 401
    end
  end

  def destroy
    @user_session = UserSession.find
    @user_session.destroy
    render :nothing => true, :status => 200
  end
end
